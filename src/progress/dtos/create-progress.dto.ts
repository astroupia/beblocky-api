import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class CreateProgressDto {
  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  courseId: string;

  @IsString()
  @IsOptional()
  @IsObjectId()
  currentLesson?: string;
}
