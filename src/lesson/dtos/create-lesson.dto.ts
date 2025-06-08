import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';
import { LessonDifficulty } from '../entities/lesson.entity';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LessonDifficulty)
  @IsOptional()
  difficulty?: LessonDifficulty;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  duration: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  course?: Types.ObjectId;

  @IsOptional()
  slides?: Types.ObjectId[];

  @IsMongoId()
  @IsNotEmpty()
  courseId: Types.ObjectId;

  @IsArray()
  @IsOptional()
  slideIds?: Types.ObjectId[];
}
