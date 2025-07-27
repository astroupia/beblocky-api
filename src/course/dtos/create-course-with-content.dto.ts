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
import { Types } from 'mongoose';
import {
  CourseSubscriptionType,
  CourseStatus,
} from '../entities/course.entity';
import { ThemeColorsDto } from '../../shared/dtos/theme-colors.dto';
import { LessonDifficulty } from '../../lesson/entities/lesson.entity';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  courseId: Types.ObjectId;

  @IsArray()
  @IsOptional()
  slides?: Types.ObjectId[];

  @IsEnum(LessonDifficulty)
  @IsOptional()
  difficulty?: LessonDifficulty = LessonDifficulty.BEGINNER;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CreateSlideDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  order: number;

  @IsString()
  @IsOptional()
  titleFont?: string;

  @IsString()
  @IsOptional()
  contentFont?: string;

  @IsString()
  @IsOptional()
  startingCode?: string;

  @IsString()
  @IsOptional()
  solutionCode?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  textColor?: string;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsOptional()
  themeColors?: ThemeColorsDto;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNotEmpty()
  courseId: Types.ObjectId;

  @IsNotEmpty()
  lessonId: Types.ObjectId;
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
