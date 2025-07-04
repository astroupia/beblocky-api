import { Types } from 'mongoose';
import { Gender } from '../entities/student.entity';

export class StudentResponseDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  role: string;
  dateOfBirth?: Date;
  grade?: number;
  gender?: Gender;
  schoolId?: Types.ObjectId;
  parentId?: Types.ObjectId;
  enrolledCourses: Types.ObjectId[];
  coins: number;
  codingStreak: number;
  lastCodingActivity?: Date;
  totalCoinsEarned: number;
  totalTimeSpent: number;
  goals?: string[];
  subscription?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class StudentStatsResponseDto {
  totalCoinsEarned: number;
  codingStreak: number;
  totalTimeSpent: number;
  enrolledCoursesCount: number;
  currentCoins: number;
}

export class StudentEnrollmentResponseDto {
  studentId: string;
  courseId: string;
  enrolled: boolean;
  message: string;
}

export class StudentCoinsResponseDto {
  studentId: string;
  previousCoins: number;
  addedCoins: number;
  newTotal: number;
  totalCoinsEarned: number;
}
