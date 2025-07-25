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
import { Types } from 'mongoose';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { Qualification, TimeSlot } from '../entities/teacher.entity';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

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

export class CreateTeacherDto extends CreateUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  @IsOptional()
  qualifications?: QualificationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  availability?: Map<string, TimeSlotDto[]>;

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
  @IsNotEmpty()
  organizationId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsObjectId()
  @IsOptional()
  subscription?: string;
}
