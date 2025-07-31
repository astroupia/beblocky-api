import { IsString, IsNotEmpty } from 'class-validator';

export class AddStudentDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;
}

export class RemoveStudentDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;
}
