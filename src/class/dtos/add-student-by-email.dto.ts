import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddStudentByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
