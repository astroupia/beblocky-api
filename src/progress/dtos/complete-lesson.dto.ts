import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class CompleteLessonDto {
  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  lessonId: string;

  @IsNumber()
  @IsOptional()
  timeSpent?: number; // Minutes spent on the lesson
}
