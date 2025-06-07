import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentDocument } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentStatus } from 'src/common/payment-provider.enums';
import { ResponseStatusDto } from '../dto/response-status.dto';

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

  async updatePaymentStatus(
    responseStatusDto: ResponseStatusDto,
  ): Promise<PaymentDocument | null> {
    console.log(responseStatusDto);

    if (!responseStatusDto.phone || !responseStatusDto.sessionId) {
      throw new Error('Missing phone or sessionId for update');
    }

    return this.paymentModel.findOneAndUpdate(
      {
        phone: responseStatusDto.phone.toString(), 
        sessionId: responseStatusDto.sessionId,
      },
      {
        transactionStatus: responseStatusDto.transactionStatus,
        transactionId: responseStatusDto.transaction?.transactionId,
      },
      { new: true },
    );
  }
}
