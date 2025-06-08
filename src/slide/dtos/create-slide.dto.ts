import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ThemeColorsDto } from '../../shared/dtos/theme-colors.dto';

export class CreateSlideDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

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
