import { Types } from 'mongoose';
import { ICreateLessonDto, ICreateSlideDto } from '..';

export enum CourseSubscriptionType {
  FREE = 'free',
  STARTER = 'starter',
  BUILDER = 'builder',
  PRO = 'pro-bundle',
  ORGANIZATION = 'organization',
}

export enum CourseStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
}

export interface ICourse {
  courseTitle: string;
  courseDescription: string;
  courseLanguage: string;
  slides: Types.ObjectId[];
  lessons: Types.ObjectId[];
  students: Types.ObjectId[];
  organization: Types.ObjectId[];
  subType: CourseSubscriptionType;
  status: CourseStatus;
  rating: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseDto {
  courseTitle: string;
  courseDescription?: string;
  courseLanguage: string;
  lessonIds?: Types.ObjectId[];
  slideIds?: Types.ObjectId[];
  organization?: Types.ObjectId[];
  subType?: CourseSubscriptionType;
  status?: CourseStatus;
  rating?: number;
  language?: string;
}

export type IUpdateCourseDto = Partial<ICreateCourseDto>;

export interface ICreateCourseWithContentDto {
  courseTitle: string;
  courseDescription: string;
  courseLanguage: string;
  lessons?: ICreateLessonDto[];
  slides?: ICreateSlideDto[];
  subType?: CourseSubscriptionType;
  status?: CourseStatus;
  rating?: number;
  language?: string;
}
