import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumber,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../entities/student.entity';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class EmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreateStudentFromUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // The existing better-auth user ID

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsNumber()
  @IsOptional()
  grade?: number;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsObjectId()
  @IsOptional()
  schoolId?: string;

  @IsObjectId()
  @IsOptional()
  parentId?: string;

  @IsObjectId({ each: true })
  @IsOptional()
  enrolledCourses?: string[];

  @IsNumber()
  @IsOptional()
  coins?: number;

  @IsNumber()
  @IsOptional()
  codingStreak?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastCodingActivity?: Date;

  @IsNumber()
  @IsOptional()
  totalCoinsEarned?: number;

  @IsNumber()
  @IsOptional()
  totalTimeSpent?: number;

  @IsString({ each: true })
  @IsOptional()
  goals?: string[];

  @IsString()
  @IsOptional()
  subscription?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @IsString()
  @IsOptional()
  section?: string;
}
