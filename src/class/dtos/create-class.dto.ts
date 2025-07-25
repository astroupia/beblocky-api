import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClassSettingsDto {
  @IsOptional()
  allowStudentEnrollment?: boolean;

  @IsOptional()
  requireApproval?: boolean;

  @IsOptional()
  autoProgress?: boolean;
}

export class ClassMetadataDto {
  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  level?: string;
}

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  className: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  courses?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  students?: string[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxStudents?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ValidateNested()
  @Type(() => ClassSettingsDto)
  @IsOptional()
  settings?: ClassSettingsDto;

  @ValidateNested()
  @Type(() => ClassMetadataDto)
  @IsOptional()
  metadata?: ClassMetadataDto;
}
