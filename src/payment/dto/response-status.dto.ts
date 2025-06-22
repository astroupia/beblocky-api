import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../../common/payment-provider.enums';

class TransactionInfo {
  @IsString()
  transactionId: string;

  @IsString()
  transactionStatus: string;
}
export class ResponseStatusDto {
  @IsOptional()
  @IsString()
  uuid?: string;

  @IsOptional()
  @IsString()
  nonce?: string;

  @IsOptional()
  @IsNumber()
  phone?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  transactionStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionInfo)
  transaction?: TransactionInfo;

  @IsOptional()
  @IsString()
  notificationUrl?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
