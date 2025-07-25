import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { RatingValue, ICreateCourseRatingDto } from '../../types';

export class CreateCourseRatingDto implements ICreateCourseRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: RatingValue;

  @IsString()
  @IsOptional()
  review?: string;
}
