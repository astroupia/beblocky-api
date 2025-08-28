import { Types } from 'mongoose';

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
  lessons?: any[]; // Simplified to avoid import conflicts
  slides?: any[]; // Simplified to avoid import conflicts
  subType?: CourseSubscriptionType;
  status?: CourseStatus;
  rating?: number;
  language?: string;
}

// Course Rating Types
// Rating values are now simple numbers (1-5) instead of enum

export interface ICourseRating {
  courseId: Types.ObjectId;
  userId: string | null; // String ID from better-auth, can be null
  rating: number; // Use number instead of RatingValue enum
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseRatingDto {
  rating: number; // Use number instead of RatingValue enum
  review?: string;
}

export type IUpdateCourseRatingDto = Partial<ICreateCourseRatingDto>;

export interface ICourseRatingResponse {
  id: string;
  courseId: string;
  userId: string | null; // Can be null for invalid records
  rating: number; // Use number instead of RatingValue enum
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number;
  };
  userRating?: number; // Use number instead of RatingValue enum
  userReview?: string;
}

// Export actual DTOs and entities from the course module
export * from '../../course/entities/course.entity';
export * from '../../course/entities/course-rating.entity';
export * from '../../course/dtos/create-course.dto';
export * from '../../course/dtos/create-course-with-content.dto';
export * from '../../course/dtos/create-course-rating.dto';
export * from '../../course/dtos/update-course-rating.dto';
export * from '../../course/dtos/course-rating-response.dto';
