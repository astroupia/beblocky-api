import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  PaymentStatus,
  PaymentMethod,
} from '../../common/payment-provider.enums';

export class Payment {
  userId: Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  TransactionId?: string;
  nonce?: string;
  phoneNumber?: string;
  email?: string;
  itemDescription?: [{}];
  expireDate?: Date;
  sessionId?: string;
}

@Schema({ timestamps: true })
export class PaymentSchemaClass {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, unique: true, sparse: true })
  TransactionId: string;

  @Prop({ type: String, unique: true, sparse: true })
  nonce: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: [{}] })
  itemDescription: [{}];

  @Prop({ type: Date })
  expireDate: Date;

  @Prop({ type: String, unique: true, sparse: true })
  sessionId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(PaymentSchemaClass);
export type PaymentDocument = PaymentSchemaClass & Document;
