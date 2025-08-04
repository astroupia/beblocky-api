import { IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentImportData {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class BulkImportStudentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentImportData)
  students: StudentImportData[];
}
