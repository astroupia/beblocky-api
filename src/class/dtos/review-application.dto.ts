import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApplicationStatus } from '../entities/organization-application.entity';

export class ReviewApplicationDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
