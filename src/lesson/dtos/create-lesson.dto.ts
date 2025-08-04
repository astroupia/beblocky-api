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
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObjectId()
  @IsNotEmpty()
  courseId: string;

  @IsArray()
  @IsOptional()
  slides?: string[];

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
