import { IsString, IsNotEmpty } from 'class-validator';

export class ThemeColorsDto {
  @IsString()
  @IsNotEmpty()
  main: string;

  @IsString()
  @IsNotEmpty()
  secondary: string;

  @IsString()
  @IsNotEmpty()
  accent: string;
}
