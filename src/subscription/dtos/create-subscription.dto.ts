import {
  IsEnum,
  IsNotEmpty,
  IsDate,
  IsBoolean,
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
} from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsEnum(SubscriptionPlan)
  @IsNotEmpty()
  planName: SubscriptionPlan;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billingCycle: BillingCycle;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastPaymentDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  nextBillingDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trialEndsAt?: Date;

  @IsBoolean()
  @IsOptional()
  cancelAtPeriodEnd?: boolean;
}
