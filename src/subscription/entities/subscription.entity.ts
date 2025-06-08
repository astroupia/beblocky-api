import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SubscriptionPlan {
  FREE = 'Free',
  STARTER = 'Starter',
  BUILDER = 'Builder',
  PRO_BUNDLE = 'Pro-Bundle',
  ORGANIZATION = 'Organization',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// Domain entity
export class Subscription {
  userId: Types.ObjectId;
  planName: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  paymentHistory: Types.ObjectId[];
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  trialEndsAt?: Date;
  cancelAtPeriodEnd: boolean;
}

// Mongoose schema class
@Schema({ timestamps: true })
export class SubscriptionSchemaClass {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(SubscriptionPlan),
    required: true,
  })
  planName: SubscriptionPlan;

  @Prop({
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  autoRenew: boolean;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({
    type: String,
    enum: Object.values(BillingCycle),
    required: true,
  })
  billingCycle: BillingCycle;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Payment' }] })
  paymentHistory: Types.ObjectId[];

  @Prop()
  lastPaymentDate?: Date;

  @Prop()
  nextBillingDate?: Date;

  @Prop()
  trialEndsAt?: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(
  SubscriptionSchemaClass,
);
export type SubscriptionDocument = SubscriptionSchemaClass & Document;
