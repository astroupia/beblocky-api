import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { CheckoutSessionResponse } from '../types/payment-response-types';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { PaymentStatus } from 'src/common/payment-provider.enums';
import { ResponseStatusDto } from '../dto/response-status.dto';
import { log } from 'console';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Wraps a promise in a timeout.
   *
   * @param fn - The function that returns a promise.
   * @param timeoutMs - The timeout in milliseconds.
   *
   * @returns {Promise<T>} - The promise.
   */
  async tryWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      // If the promise takes longer than the timeout, reject it
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs),
      ),
    ]);
  }

  /**
   * Retrieves the payment beneficiaries from the environment configuration.
   *
   * @returns {string} - An object representing the payment beneficiaries.
   *
   * @throws {Error} - If the environment variable is not set or the JSON parsing fails.
   */
  getPaymentBeneficiaries(): string {
    const raw = this.configService.get<string>('PAYMENT_BENEFICIARIES');

    if (!raw) {
      throw new Error(
        'PAYMENT_BENEFICIARIES is not set in the environment variables',
      );
    }

    try {
      const beneficiaries = JSON.parse(raw);
      return beneficiaries;
    } catch (err) {
      throw new Error('Failed to parse PAYMENT_BENEFICIARIES JSON');
    }
  }

  /**
   * Creates a payment checkout session using the ArifPay Express SDK.
   *
   * The method attempts to create a session up to 3 times, each with a 5-second timeout.
   * If all attempts fail, it saves the failed payment attempt to the database with a status of 'FAILED'.
   *
   * On success, it stores the payment details and returns the ArifPay session data.
   *
   * @param {CreatePaymentDto} createPaymentDto - The DTO containing phone, email, items, URLs, and other metadata.
   * @returns {Promise<any>} - Resolves to session data from ArifPay if successful, or saved fallback payment record if all retries fail.
   *
   * @throws {BadRequestException} - Thrown when SDK import or session creation encounters an unexpected error.
   *
   * Required environment variables:
   * - CANCEL_URL
   * - SUCCESS_URL
   * - ERROR_URL
   * - NOTIFY_URL    // Used for ArifPay webhook callbacks
   * - API_KEY
   * - BASE_URL      // Set to https://gateway.arifpay.net/api in production
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    try {
      const { createCheckoutSession } = await import('arifpay-express');

      const payload = {
        phone: createPaymentDto.phone,
        items: createPaymentDto.items,
        email: createPaymentDto.email,
        beneficiaries: this.getPaymentBeneficiaries(),
        cancelUrl: createPaymentDto.cancelUrl,
        successUrl: createPaymentDto.successUrl,
        errorUrl: createPaymentDto.errorUrl,
        notifyUrl: createPaymentDto.notifyUrl,
      };

      let lastError: any;

      // Try up to 3 times with a 5-second timeout each
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result: CheckoutSessionResponse = await this.tryWithTimeout(
            () => createCheckoutSession(payload),
            5000,
          );

          // Save successful payment metadata to DB
          const paymentToSave = {
            ...createPaymentDto,
            userId: new Types.ObjectId(createPaymentDto.userId),
            sessionId: result.data.sessionId,
            transactionStatus: PaymentStatus.PENDING,
          };

          await this.paymentRepository.create(paymentToSave);

          return result.data;
        } catch (err) {
          lastError = err;
          console.warn(`ArifPay attempt ${attempt} failed:`, err);
        }
      }

      // If all attempts fail, log failed attempt with fallback data
      const fallbackSave = {
        ...createPaymentDto,
        userId: new Types.ObjectId(createPaymentDto.userId),
        sessionId: lastError?.data?.sessionId || null,
        transactionStatus: PaymentStatus.FAILED,
      };

      return this.paymentRepository.create(fallbackSave);
    } catch (error) {
      console.error('ArifPay SDK error:', error);
      throw new BadRequestException({
        message: 'Failed to create payment session',
        error: error || 'Unknown error',
      });
    }
  }

  async getResponseStatus(
    responseStatusDto: Partial<ResponseStatusDto>,
  ): Promise<any> {
    try {
      const { sessionId, phone, transactionStatus } = responseStatusDto;

      if (transactionStatus === PaymentStatus.SUCCESS) {
        const updatedPayment = await this.paymentRepository.updatePaymentStatus(
          {
            sessionId,
            phone,
            transactionStatus: PaymentStatus.SUCCESS,
            transaction: responseStatusDto.transaction,
          },
        );

        return updatedPayment;
      }

      // Gracefully handle non-success status
      return { message: 'Transaction not successful or no action required' };
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to process transaction status',
        error: error,
      });
    }
  }
}
