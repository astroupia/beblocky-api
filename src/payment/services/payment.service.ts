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

  getPaymentBeneficiaries(): any {
    const raw = this.configService.get<string>('PAYMENT_BENEFICIARIES');
    if (!raw) throw new Error('PAYMENT_BENEFICIARIES is not set');
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('Invalid PAYMENT_BENEFICIARIES JSON');
    }
  }

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<CheckoutSessionResponse['data'] | PaymentDocument> {
    try {
      const { createCheckoutSession } = await import('arifpay-express');
      const payload = {
        ...createPaymentDto,
        beneficiaries: this.getPaymentBeneficiaries(),
      };

      let lastError: any;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result: CheckoutSessionResponse = await this.tryWithTimeout(
            () => createCheckoutSession(payload),
            5000,
          );

          const paymentToSave = {
            ...createPaymentDto,
            userId: createUserId(createPaymentDto.userId, 'userId'),
            sessionId: result.data.sessionId,
            transactionStatus: PaymentStatus.PENDING,
          };

          await this.paymentRepository.create(paymentToSave);

          paymentLogger.info({
            event: 'Payment Session Created',
            userId: createPaymentDto.userId,
            sessionId: result.data.sessionId,
            status: 'PENDING',
          });

          return result.data;
        } catch (err) {
          lastError = err;
          paymentLogger.warn({
            event: 'Payment Attempt Failed',
            attempt,
            reason: err,
          });
        }
      }

      const fallbackSave = {
        ...createPaymentDto,
        userId: createUserId(createPaymentDto.userId, 'userId'),
        sessionId: lastError?.data?.sessionId || null,
        transactionStatus: PaymentStatus.FAILED,
      };

      paymentLogger.error({
        event: 'Payment Session Failed After Retries',
        userId: createPaymentDto.userId,
        reason: lastError?.message || 'Unknown',
      });

      return this.paymentRepository.create(fallbackSave);
    } catch (error) {
      paymentLogger.error({
        event: 'ArifPay SDK Error',
        message: error,
      });
      throw new BadRequestException({
        message: 'Failed to create payment session',
        error: error,
      });
    }
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
