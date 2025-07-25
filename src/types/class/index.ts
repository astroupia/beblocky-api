import { Types } from 'mongoose';

// Enums
export enum ClassUserType {
  TEACHER = 'teacher',
  ADMIN = 'admin',
  PARENT = 'parent',
}

// Sub-interfaces
export interface IClassSettings {
  allowStudentEnrollment: boolean;
  requireApproval: boolean;
  autoProgress: boolean;
}

export interface IClassMetadata {
  grade?: string;
  subject?: string;
  level?: string;
}

export interface IClassCreator {
  userId: Types.ObjectId;
  userType: ClassUserType;
}

// Main Class interface
export interface IClass {
  className: string;
  description?: string;
  createdBy: IClassCreator;
  organizationId?: Types.ObjectId;
  courses: Types.ObjectId[];
  students: Types.ObjectId[];
  maxStudents?: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  settings?: IClassSettings;
  metadata?: IClassMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// DTO interfaces
export interface ICreateClassDto {
  className: string;
  description?: string;
  courses?: string[];
  students?: string[];
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  settings?: IClassSettings;
  metadata?: IClassMetadata;
}

export interface IUpdateClassDto {
  className?: string;
  description?: string;
  courses?: string[];
  students?: string[];
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  settings?: IClassSettings;
  metadata?: IClassMetadata;
}

export interface IUpdateClassSettingsDto {
  allowStudentEnrollment?: boolean;
  requireApproval?: boolean;
  autoProgress?: boolean;
}

export interface IAddStudentDto {
  studentId: string;
}

export interface IRemoveStudentDto {
  studentId: string;
}

export interface IAddCourseDto {
  courseId: string;
}

export interface IRemoveCourseDto {
  courseId: string;
}

export interface ICreateApplicationDto {
  organizationId: string;
  message?: string;
}

export interface IReviewApplicationDto {
  status: string;
  reviewMessage?: string;
}

export interface IExtendClassDto {
  endDate: string;
}

// Stats interface
export interface IClassStats {
  totalStudents: number;
  totalCourses: number;
  averageProgress: number;
  activeStudents: number;
}

// Organization Application interfaces
export interface IOrganizationApplication {
  id: string;
  organizationId: Types.ObjectId;
  classId: Types.ObjectId;
  status: string;
  message?: string;
  reviewMessage?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Export actual DTOs and entities from the class module
export * from '../../class/entities/class.entity';
export * from '../../class/entities/organization-application.entity';
export * from '../../class/dtos/create-class.dto';
export * from '../../class/dtos/update-class.dto';
export * from '../../class/dtos/update-class-settings.dto';
export * from '../../class/dtos/add-student.dto';
export * from '../../class/dtos/add-course.dto';
export * from '../../class/dtos/create-application.dto';
export * from '../../class/dtos/review-application.dto';
