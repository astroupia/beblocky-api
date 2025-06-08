import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import {
  CourseSubscriptionType,
  CourseStatus,
} from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  courseLanguage: string;

  @IsArray()
  @IsOptional()
  lessonIds?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  slideIds?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  organization?: Types.ObjectId[];

  @IsEnum(CourseSubscriptionType)
  @IsOptional()
  subType?: CourseSubscriptionType;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  language?: string;
}
