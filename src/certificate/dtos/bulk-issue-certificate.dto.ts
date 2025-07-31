import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class BulkIssueCertificateDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  studentIds: string[];

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  instructorName?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;
}
