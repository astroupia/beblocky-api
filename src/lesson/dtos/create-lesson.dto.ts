import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
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
