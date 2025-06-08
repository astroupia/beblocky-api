import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEmail,
  IsUrl,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationType } from '../entities/organization.entity';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

class ContactInfoDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

class FeaturesDto {
  @IsBoolean()
  @IsOptional()
  hasStudentTracking?: boolean;

  @IsBoolean()
  @IsOptional()
  hasProgressTracking?: boolean;

  @IsBoolean()
  @IsOptional()
  hasLeaderboard?: boolean;
}

class AcademicYearDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

class SettingsDto {
  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @ValidateNested()
  @Type(() => AcademicYearDto)
  @IsOptional()
  academicYear?: AcademicYearDto;
}

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(OrganizationType)
  @IsNotEmpty()
  type: OrganizationType;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  @IsNotEmpty()
  contactInfo: ContactInfoDto;

  @ValidateNested()
  @Type(() => FeaturesDto)
  @IsOptional()
  features?: FeaturesDto;

  @ValidateNested()
  @Type(() => SettingsDto)
  @IsOptional()
  settings?: SettingsDto;

  @IsString()
  @IsOptional()
  businessLicenseNumber?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accreditation?: string[];
}
