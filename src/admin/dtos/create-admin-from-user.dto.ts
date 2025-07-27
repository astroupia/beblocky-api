import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { AdminAccessLevel } from '../entities/admin.entity';

export class CreateAdminFromUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // The existing better-auth user ID

  @IsEnum(AdminAccessLevel)
  @IsOptional()
  accessLevel?: AdminAccessLevel;

  @IsString()
  @IsOptional()
  department?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;

  @IsString()
  @IsOptional()
  assignedRegion?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  managedOrganizations?: string[];
}
