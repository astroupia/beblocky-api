import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber({}, { message: 'Phone must be a number.' })
  @IsNotEmpty({ message: 'Phone number is required.' })
  phone: number;

  @IsString({ message: 'Cancel URL must be a string.' })
  @IsNotEmpty({ message: 'Cancel URL is required.' })
  cancelUrl: string;

  @IsString({ message: 'Success URL must be a string.' })
  @IsNotEmpty({ message: 'Success URL is required.' })
  successUrl: string;

  @IsString({ message: 'Error URL must be a string.' })
  @IsNotEmpty({ message: 'Error URL is required.' })
  errorUrl: string;

  @IsString({ message: 'Notify URL must be a string.' })
  @IsNotEmpty({ message: 'Notify URL is required.' })
  notifyUrl: string;

  @IsArray({ message: 'Items must be an array.' })
  @IsNotEmpty({ message: 'Items array cannot be empty.' })
  items: any[];

  @IsArray({ message: 'Beneficiaries must be an array.' })
  @IsNotEmpty({ message: 'Beneficiaries array cannot be empty.' })
  beneficiaries: any[];

  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsOptional()
  email?: string;
}
