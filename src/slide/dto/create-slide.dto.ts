import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateSlideDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsMongoId()
  @IsNotEmpty()
  courseId: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  lessonId?: Types.ObjectId;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
