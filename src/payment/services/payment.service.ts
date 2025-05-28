import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { createCheckoutSession } from 'arifpay-express';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class PaymentService {
  /**
   * Creates a checkout session  using ArifPay Express SDK.
   *
   * If successful, it returns the session data(SessionId, paymentUrl, cancelUrl, totalAmount).
   *
   * @param {createPaymentDto} createPaymentDto - The DTO containing phone,email, items, beneficiaries.
   * @returns {Promise<any>} - A promise that resolves to the session data.
   *
   * @throws {BadRequestException} - If the SDK throws an error or required fields are missing.
   *
   * Required environment variables:
   * - CANCEL_URL
   * - SUCCESS_URL
   * - ERROR_URL
   * - NOTIFY_URL //Will receive webhook notifications from ArifPay trough this URL
   * - API_KEY
   * - BASE_URL //Set value to https://gateway.arifpay.net/api in prod environment
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    try {
      const result = await createCheckoutSession({
        cancelUrl: process.env.CANCEL_URL,
        successUrl: process.env.SUCCESS_URL,
        errorUrl: process.env.ERROR_URL,
        notifyUrl: process.env.NOTIFY_URL,
        items: createPaymentDto.items,
        beneficiaries: createPaymentDto.beneficiaries,
        email: createPaymentDto.email,
        phone: createPaymentDto.phone,
      });
      return result.data;
    } catch (error) {
      console.error('ArifPay SDK error:', error);
      throw new BadRequestException({
        message: 'Failed to create payment session',
        error: error,
      });
    }
  }
}
