import {
  IsMongoId,
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../common/payment-provider.enums';
import { Types } from 'mongoose';

export class Item {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class CreatePaymentDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsNumber()
  amount: number;

  @IsString()
  cancelUrl: string;

  @IsString()
  successUrl: string;

  @IsString()
  errorUrl: string;

  @IsString()
  notifyUrl: string;

  @IsNumber()
  @IsOptional()
  phone?: number;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nonce?: string;

  @IsArray()
  @IsEnum(PaymentMethod, { each: true })
  paymentMethods?: PaymentMethod[];

  @IsDateString()
  expireDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Item)
  items: Item[];

  @IsString()
  @IsOptional()
  lang?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  transactionStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionId?: string | null;

  @IsString()
  @IsOptional()
  sessionId?: string | null;
}
