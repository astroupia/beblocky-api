import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  lessonIds?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  slideIds?: Types.ObjectId[];
}
