import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsPhoneNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationshipType } from '../entities/parent.entity';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

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

class EmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;
}

export class CreateParentFromUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // The existing better-auth user ID

  @IsEnum(RelationshipType)
  @IsOptional()
  relationship?: RelationshipType;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsArray()
  @IsObjectId({ each: true })
  @IsOptional()
  children?: string[]; // Array of student IDs

  @ValidateNested()
  @IsOptional()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => AddressDto)
  address?: AddressDto;
}
