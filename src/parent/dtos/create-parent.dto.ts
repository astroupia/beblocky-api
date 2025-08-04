import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationshipType } from '../entities/parent.entity';
import { Types } from 'mongoose';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  subCity: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateParentDto {
  @IsArray()
  @IsOptional()
  children?: Types.ObjectId[];

  @IsEnum(RelationshipType)
  @IsNotEmpty()
  relationship: RelationshipType;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;
}
