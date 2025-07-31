import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentDocument } from '../entities/payment.entity';
import { ResponseStatusDto } from '../dto/response-status.dto';
import { Types } from 'mongoose';
import { PaymentStatus } from '../../common/payment-provider.enums';
@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel('Payment')
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Creates a new payment document from the given data.
   * @param data Partial<PaymentDocument> - The data to create the payment document from.
   * @returns Promise<PaymentDocument> - The newly created payment document.
   */
  async create(data: Partial<PaymentDocument>): Promise<PaymentDocument> {
    // Create a new payment document from the given data.
    const payment = new this.paymentModel(data);
    // Save the payment document to the database.
    return await payment.save();
  }

  /**
   * Updates the transaction status of a payment if it's not already marked as SUCCESS.
   *
   * @param responseStatusDto - Contains sessionId, phone, transactionStatus, and optional transaction ID.
   * @returns The updated PaymentDocument, the existing one if already SUCCESS, or null if not found.
   */
  async updatePaymentStatus(
    responseStatusDto: ResponseStatusDto,
  ): Promise<PaymentDocument | null> {
    const { phone, sessionId, transaction, transactionStatus } =
      responseStatusDto;

    const existing = await this.paymentModel.findOne({
      sessionId,
      phone: Number(phone),
    });

    if (!existing) {
      return null; // not found
    }

    if (existing.transactionStatus === PaymentStatus.SUCCESS) {
      return existing;
    }

    return this.paymentModel.findOneAndUpdate(
      {
        sessionId,
        phone: Number(phone),
      },
      {
        transactionStatus,
        transactionId: transaction?.transactionId,
      },
      { new: true },
    );
  }

  /**
   * Finds a single payment record by sessionId and phone number.
   *
   * @param sessionId - The unique session identifier.
   * @param phone - The associated phone number.
   * @returns A matching payment document or null.
   */
  async findBySessionIdAndPhone(
    sessionId: string,
    phone: number,
  ): Promise<PaymentDocument | null> {
    return this.paymentModel
      .findOne({
        sessionId: sessionId.trim(),
        phone: Number(phone),
      })
      .exec();
  }

  /**
   * Updates the payment record's transaction status and optional transactionId.
   *
   * @param sessionId - The session ID of the payment.
   * @param phone - The phone number associated with the payment.
   * @param transactionStatus - New transaction status.
   * @param transactionId - (Optional) Transaction ID.
   * @returns The updated PaymentDocument or null if not found.
   */
  async updateStatus(
    sessionId: string,
    phone: number,
    transactionStatus: string,
    transactionId?: string,
  ): Promise<PaymentDocument | null> {
    return this.paymentModel
      .findOneAndUpdate(
        {
          sessionId: sessionId.trim(),
          phone: Number(phone),
        },
        {
          transactionStatus,
          transactionId,
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Finds all payments made by a specific user based on their string user ID from better-auth.
   *
   * @param userId - The user's unique string ID from better-auth.
   * @returns A Promise that resolves to an array of PaymentDocument objects.
   *
   * @example
   * const payments = await paymentRepository.findByUserId('user_123456789');
   */
  async findByUserId(userId: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({
        userId: userId,
      })
      .exec();
  }
}
