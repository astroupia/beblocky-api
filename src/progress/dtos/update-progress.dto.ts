import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressDto } from './create-progress.dto';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateProgressDto extends PartialType(CreateProgressDto) {
  @IsOptional()
  @IsNumber()
  completionPercentage?: number;

  @IsOptional()
  @IsNumber()
  coinsEarned?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
