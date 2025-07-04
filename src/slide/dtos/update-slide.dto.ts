import { PartialType } from '@nestjs/mapped-types';
import { CreateSlideDto } from './create-slide.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateSlideDto extends PartialType(CreateSlideDto) {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  removeImageUrls?: string[];
}
