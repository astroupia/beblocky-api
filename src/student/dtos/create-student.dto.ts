import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsMongoId,
  IsNumber,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { Gender } from '../entities/student.entity';
import { Types } from 'mongoose';

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

export class CreateStudentDto extends CreateUserDto {
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

  @IsMongoId()
  @IsOptional()
  schoolId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  parentId?: Types.ObjectId;

  @IsMongoId({ each: true })
  @IsOptional()
  enrolledCourses?: Types.ObjectId[];

  @IsNumber()
  @IsOptional()
  coins?: number;

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
