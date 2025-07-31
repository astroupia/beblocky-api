import { Types } from 'mongoose';
import { ICreateUserDto, IUpdateUserDto } from '../user';

export interface IQualification {
  degree: string;
  institution: string;
  year: number;
  specialization: string;
}

export interface ITimeSlot {
  startTime: string;
  endTime: string;
}

export interface ITeacher {
  userId: string; // String ID from better-auth
  qualifications: IQualification[];
  availability: Record<string, ITimeSlot[]>;
  rating: number[];
  courses: Types.ObjectId[];
  organizationId?: Types.ObjectId;
  languages: string[];
  subscription?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTeacherDto extends ICreateUserDto {
  qualifications?: IQualification[];
  availability?: Record<string, ITimeSlot[]>;
  rating?: number[];
  courses?: Types.ObjectId[];
  organizationId?: Types.ObjectId;
  languages?: string[];
  subscription?: Types.ObjectId;
}

export type IUpdateTeacherDto = Partial<ICreateTeacherDto> &
  Partial<IUpdateUserDto>;

// Export actual DTOs and entities from the teacher module
export * from '../../teacher/entities/teacher.entity';
export * from '../../teacher/dtos/create-teacher.dto';
export * from '../../teacher/dtos/update-teacher.dto';
