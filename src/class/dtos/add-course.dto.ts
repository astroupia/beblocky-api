import { IsString, IsNotEmpty } from 'class-validator';

export class AddCourseDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;
}

export class RemoveCourseDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
