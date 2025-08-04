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
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @IsString()
  @IsOptional()
  courseDescription?: string;

  @IsString()
  @IsNotEmpty()
  courseLanguage: string;

  @IsArray()
  @IsOptional()
  lessonIds?: string[];

  @IsArray()
  @IsOptional()
  slideIds?: string[];

  @IsArray()
  @IsOptional()
  organization?: string[];

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
