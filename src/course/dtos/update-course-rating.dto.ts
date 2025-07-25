import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseRatingDto } from './create-course-rating.dto';
import { IUpdateCourseRatingDto } from '../../types';

export class UpdateCourseRatingDto extends PartialType(CreateCourseRatingDto) {}
