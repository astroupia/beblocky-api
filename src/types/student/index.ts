import { Types } from 'mongoose';
import { ICreateUserDto, IUpdateUserDto } from '../user';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IStudent {
  dateOfBirth?: Date;
  grade?: number;
  gender?: Gender;
  schoolId?: Types.ObjectId;
  parentId?: Types.ObjectId;
  enrolledCourses: Types.ObjectId[];
  coins: number;
  goals?: string[];
  subscription?: string;
  emergencyContact?: IEmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateStudentDto extends ICreateUserDto {
  dateOfBirth?: Date;
  grade?: number;
  gender?: Gender;
  schoolId?: Types.ObjectId;
  parentId?: Types.ObjectId;
  enrolledCourses?: Types.ObjectId[];
  coins?: number;
  goals?: string[];
  subscription?: string;
  emergencyContact?: IEmergencyContact;
  section?: string;
}

export type IUpdateStudentDto = Partial<ICreateStudentDto> &
  Partial<IUpdateUserDto>;

export interface IEnrollCourseDto {
  courseId: Types.ObjectId;
}

export interface IAddCoinsDto {
  amount: number;
}

export interface IAddGoalDto {
  title: string;
  description: string;
  targetDate: Date;
}
