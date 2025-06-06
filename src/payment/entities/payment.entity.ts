import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../common/payment-provider.enums';

@Schema({ _id: false })
class Item {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop()
  description?: string;

  @Prop()
  image?: string;
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  cancelUrl: string;

  @Prop({ required: true })
  successUrl: string;

  @Prop({ required: true })
  errorUrl: string;

  @Prop({ required: true })
  notifyUrl: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ unique: true, sparse: true })
  nonce?: string;

  @Prop({
    type: [String],
    enum: Object.values(PaymentMethod),
    required: true,
  })
  paymentMethods: PaymentMethod[];

  @Prop({ type: Date, required: true })
  expireDate: Date;

  @Prop({ type: [Item], required: true })
  items: Item[];

  @Prop()
  lang?: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  transactionStatus?: PaymentStatus;

  @Prop({ type: String, unique: true, sparse: true })
  transactionId?: string | null;

  @Prop({ type: String, unique: true, sparse: true })
  sessionId?: string | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
export type PaymentDocument = Payment & Document;
