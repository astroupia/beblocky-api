import { Types } from 'mongoose';

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

export interface ISubscription {
  userId: string; // String ID from better-auth
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSubscriptionDto {
  userId: string; // String ID from better-auth
  planName: SubscriptionPlan;
  status?: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew?: boolean;
  price: number;
  currency?: string;
  billingCycle: BillingCycle;
  features?: string[];
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  trialEndsAt?: Date;
  cancelAtPeriodEnd?: boolean;
}

export type IUpdateSubscriptionDto = Partial<ICreateSubscriptionDto>;

// Export actual DTOs and entities from the subscription module
export * from '../../subscription/entities/subscription.entity';
export * from '../../subscription/dtos/create-subscription.dto';
export * from '../../subscription/dtos/update-subscription.dto';
