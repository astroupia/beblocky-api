import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  lessonId?: string;

  @IsString()
  @IsOptional()
  slideId?: string;
}
