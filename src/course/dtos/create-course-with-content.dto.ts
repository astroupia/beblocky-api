import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CourseSubscriptionType,
  CourseStatus,
} from '../entities/course.entity';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateSlideDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  order?: number;
}

export class CreateCourseWithContentDto {
  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @IsString()
  @IsNotEmpty()
  courseDescription: string;

  @IsString()
  @IsNotEmpty()
  courseLanguage: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  @IsOptional()
  lessons?: CreateLessonDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSlideDto)
  @IsOptional()
  slides?: CreateSlideDto[];

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
