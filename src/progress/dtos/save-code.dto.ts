import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { IsObjectId } from '../../common/decorators/is-object-id.decorator';

export class SaveCodeDto {
  @IsString()
  @IsNotEmpty()
  @IsObjectId()
  lessonId: string;

  @IsString()
  @IsIn(['html', 'python', 'javascript', 'typescript'])
  language: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
