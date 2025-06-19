import { IsEnum, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { AdminAccessLevel } from '../entities/admin.entity';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

export class CreateAdminDto extends CreateUserDto {
  @IsEnum(AdminAccessLevel)
  @IsOptional()
  accessLevel?: AdminAccessLevel;

  @IsArray()
  @IsOptional()
  managedOrganizations?: Types.ObjectId[];
}
