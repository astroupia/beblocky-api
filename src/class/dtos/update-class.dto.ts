import { PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';
import {
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ExtendClassDto {
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
