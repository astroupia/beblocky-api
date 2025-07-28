import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Qualification, TimeSlot } from '../entities/teacher.entity';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';
import { createUserId } from '../../utils/user-id.utils';

export class QualificationDto implements Qualification {
  @IsString()
  @IsNotEmpty()
  degree: string;

  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number;

  @IsString()
  @IsNotEmpty()
  specialization: string;
}

export class TimeSlotDto implements TimeSlot {
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateTeacherFromUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // The existing better-auth user ID

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  @IsOptional()
  qualifications?: QualificationDto[];

  @IsOptional()
  availability?: Record<string, TimeSlotDto[]>;

  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(5, { each: true })
  @IsOptional()
  rating?: number[];

  @IsArray()
  @IsObjectId({ each: true })
  @IsOptional()
  courses?: string[];

  @IsObjectId()
  @IsOptional()
  organizationId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsObjectId()
  @IsOptional()
  subscription?: string;
}
