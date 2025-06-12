import { IsEnum, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { AdminAccessLevel } from '../entities/admin.entity';

export class CreateAdminDto {
  @IsEnum(AdminAccessLevel)
  @IsOptional()
  accessLevel?: AdminAccessLevel;

  @IsArray()
  @IsOptional()
  managedOrganizations?: Types.ObjectId[];
}
