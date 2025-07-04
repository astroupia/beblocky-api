import { Types } from 'mongoose';

export class ProgressResponseDto {
  id: string;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  completedLessons: { [lessonId: string]: any };
  completionPercentage: number;
  timeSpent: { [weekKey: string]: number };
  coinsEarned: number;
  lessonCode: { [lessonId: string]: any };
  currentLesson?: Types.ObjectId;
  startedAt: Date;
  lastCompletedAt?: Date;
  isActive: boolean;
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class StudentProgressSummaryDto {
  studentId: Types.ObjectId;
  progress: {
    courseId: Types.ObjectId;
    courseTitle: string;
    completionPercentage: number;
    completedLessons: number;
    totalLessons: number;
    coinsEarned: number;
    currentLesson?: Types.ObjectId;
  }[];
}

export class CourseProgressSummaryDto {
  courseId: Types.ObjectId;
  progress: {
    studentId: Types.ObjectId;
    studentName: string;
    completionPercentage: number;
    completedLessons: number;
    totalLessons: number;
    coinsEarned: number;
    lastActivity: Date;
  }[];
}
