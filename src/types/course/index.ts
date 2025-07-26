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

// Course Rating Types
export enum RatingValue {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export interface ICourseRating {
  courseId: Types.ObjectId;
  userId: string; // String ID from better-auth
  rating: RatingValue;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseRatingDto {
  rating: RatingValue;
  review?: string;
}

export type IUpdateCourseRatingDto = Partial<ICreateCourseRatingDto>;

export interface ICourseRatingResponse {
  id: string;
  courseId: string;
  userId: string;
  rating: RatingValue;
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
  userRating?: RatingValue;
  userReview?: string;
}
