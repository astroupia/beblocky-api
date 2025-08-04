import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentRepository } from '../repositories/payment.repository';
import { CheckoutSessionResponse } from '../types/payment-response-types';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { PaymentStatus } from 'src/common/payment-provider.enums';
import { ResponseStatusDto } from '../dto/response-status.dto';
import { PaymentDocument } from '../entities/payment.entity';
import { createObjectId } from '../../utils/object-id.utils';
import { createUserId } from '../../utils/user-id.utils';
import { paymentLogger } from 'src/utils/logger';
import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly configService: ConfigService,
  ) {}

  async tryWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs),
      ),
    ]);
  }

  getPaymentBeneficiaries(): Record<string, unknown> {
    const raw = this.configService.get<string>('PAYMENT_BENEFICIARIES');
    if (!raw) throw new Error('PAYMENT_BENEFICIARIES is not set');
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('Invalid PAYMENT_BENEFICIARIES JSON');
    }
  }
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const BASE_URL =
      process.env.NODE_ENV === 'production'
        ? 'https://gateway.arifpay.net'
        : 'https://gateway.arifpay.org';

    const API_KEY = process.env.ARIFPAY_API_KEY;
    const BENEFICIARY_ACCOUNT = process.env.ARIFPAY_BENEFICIARY_ACCOUNT;
    const BENEFICIARY_BANK = process.env.ARIFPAY_BENEFICIARY_BANK;

    const CANCEL_URL = process.env.CANCEL_URL;
    const SUCCESS_URL = process.env.SUCCESS_URL;
    const ERROR_URL = process.env.ERROR_URL;
    const NOTIFY_URL = process.env.NOTIFY_URL;

    const headers = {
      'Content-Type': 'application/json',
      'x-arifpay-key': API_KEY,
    };

    const payload = {
      nonce: createPaymentDto.nonce || uuidv4(),
      cancelUrl: CANCEL_URL,
      successUrl: SUCCESS_URL,
      errorUrl: ERROR_URL,
      notifyUrl: NOTIFY_URL,
      phone: createPaymentDto.phone?.toString(),
      email: createPaymentDto.email,
      expireDate: createPaymentDto.expireDate,
      items: createPaymentDto.items,
      paymentMethods: createPaymentDto.paymentMethods,
      beneficiaries: [
        {
          accountNumber: BENEFICIARY_ACCOUNT,
          bank: BENEFICIARY_BANK,
          amount: createPaymentDto.amount,
        },
      ],
      lang: createPaymentDto.lang || 'EN',
    };

    let lastError: AxiosError | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/checkout/session`,
          payload,
          { headers },
        );

        const sessionId = response.data?.data?.sessionId;

        const paymentToSave = {
          ...createPaymentDto,
          userId: new Types.ObjectId(createPaymentDto.userId),
          sessionId: sessionId,
          transactionStatus: PaymentStatus.PENDING,
        };

        await this.paymentRepository.create(paymentToSave);
        paymentLogger.info({
          event: 'Payment Session Created',
          userId: createPaymentDto.userId,
          sessionId,
          attempt,
          status: 'PENDING',
        });

        return response.data;
      } catch (err) {
        lastError = err as AxiosError;
        const errorData =
          lastError?.response?.data || lastError?.message || 'Unknown error';

        paymentLogger.warn({
          event: 'Payment Attempt Failed',
          userId: createPaymentDto.userId,
          attempt,
          reason: errorData,
        });
      }
    }

    paymentLogger.error({
      event: 'Payment Session Failed After Retries',
      userId: createPaymentDto.userId,
      reason:
        lastError?.response?.data || lastError?.message || 'Unknown failure',
      status: lastError?.response?.status,
      headers: lastError?.response?.headers,
      url: lastError?.config?.url,
      method: lastError?.config?.method,
    });

    throw new Error(
      'Failed to create ArifPay payment session after 3 retries.',
    );

  }

  async updatePaymentStatus(responseStatusDto: ResponseStatusDto): Promise<{
    statusCode: number;
    message: string;
    data?: PaymentDocument | null;
  }> {
    const { phone, sessionId, transactionStatus, transaction } =
      responseStatusDto;

    if (!phone || !sessionId || !transactionStatus) {
      paymentLogger.warn({
        event: 'Missing Fields on Update',
        sessionId,
        phone,
      });

      return {
        statusCode: 400,
        message: 'Missing required fields',
        data: null,
      };
    }

    const existing = await this.paymentRepository.findBySessionIdAndPhone(
      sessionId,
      Number(phone),
    );

    if (!existing) {
      paymentLogger.warn({
        event: 'Payment Not Found for Update',
        sessionId,
        phone,
      });

      return {
        statusCode: 404,
        message: 'Payment not found',
        data: null,
      };
    }

    if (existing.transactionStatus === PaymentStatus.SUCCESS) {
      paymentLogger.info({
        event: 'No Update Needed',
        sessionId,
        phone,
        reason: 'Already SUCCESS',
      });

      return {
        statusCode: 200,
        message: 'Already marked SUCCESS',
        data: existing,
      };
    }

    const updated = await this.paymentRepository.updateStatus(
      sessionId,
      Number(phone),
      transactionStatus,
      transaction?.transactionId,
    );

    if (!updated) {
      paymentLogger.error({
        event: 'Payment Update Failed',
        sessionId,
        phone,
        attemptedStatus: transactionStatus,
      });

      return {
        statusCode: 500,
        message: 'Failed to update payment status.',
        data: null,
      };
    }

    paymentLogger.info({
      event: 'Payment Updated',
      sessionId,
      phone,
      newStatus: transactionStatus,
    });

    return {
      statusCode: 200,
      message: 'Payment updated successfully.',
      data: updated,
    };
  }

  async getUserPayments(userId: string): Promise<{
    statusCode: number;
    message: string;
    data: PaymentDocument[] | null;
  }> {
    if (!userId) {
      return {
        statusCode: 400,
        message: 'User ID is required',
        data: null,
      };
    }

    const payments = await this.paymentRepository.findByUserId(userId);

    if (!payments?.length) {
      paymentLogger.info({
        event: 'No Payments Found',
        userId,
      });

      return {
        statusCode: 404,
        message: 'No payments found for this user',
        data: null,
      };
    }

    paymentLogger.info({
      event: 'Fetched Payments',
      userId,
      count: payments.length,
    });

    return {
      statusCode: 200,
      message: 'Payments fetched successfully',
      data: payments,
    };
  }
}
