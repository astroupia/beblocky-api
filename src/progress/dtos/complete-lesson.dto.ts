import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CompleteLessonDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsNumber()
  @IsOptional()
  timeSpent?: number; // Minutes spent on the lesson
}
