import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  image?: string;
}
