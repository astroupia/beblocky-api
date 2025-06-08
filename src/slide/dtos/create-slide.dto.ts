import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsHexColor,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class ThemeColorsDto {
  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  main: string;

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  secondary: string;
}

export class CreateSlideDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  titleFont: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contentFont: string;

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
  @IsHexColor()
  @IsNotEmpty()
  @IsOptional()
  backgroundColor: string;

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  textColor: string;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsNotEmpty()
  @IsOptional()
  themeColors: ThemeColorsDto;

  courseId: Types.ObjectId;

  lessonId: Types.ObjectId;
}
