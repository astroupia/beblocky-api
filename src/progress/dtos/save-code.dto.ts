import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class SaveCodeDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsIn(['html', 'python', 'javascript', 'typescript'])
  language: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
