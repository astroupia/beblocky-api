import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class CreateAiConversationDto {
  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  studentId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  initialMessage?: string;

  @IsString()
  @IsOptional()
  lessonId?: string;

  @IsString()
  @IsOptional()
  slideId?: string;
}
