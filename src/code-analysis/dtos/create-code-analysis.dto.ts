import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class CreateCodeAnalysisDto {
  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  progressId: string;

  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  codeContent: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsOptional()
  customInstructions?: string;
}
