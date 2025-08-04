import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateClassSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowStudentEnrollment?: boolean;

  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  autoProgress?: boolean;
}
