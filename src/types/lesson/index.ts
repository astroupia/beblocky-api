import { Types } from 'mongoose';

export enum LessonDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface ILesson {
  title: string;
  description?: string;
  course: Types.ObjectId;
  slides: Types.ObjectId[];
  difficulty: LessonDifficulty;
  duration: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateLessonDto {
  title: string;
  description?: string;
  courseId: Types.ObjectId;
  slides?: Types.ObjectId[];
  difficulty?: LessonDifficulty;
  duration: number;
  tags?: string[];
}

// Partial update DTO that excludes courseId from being updated
export type IUpdateLessonDto = Partial<Omit<ICreateLessonDto, 'courseId'>>;

export interface IAddSlideDto {
  slideId: Types.ObjectId;
}

export interface IReorderLessonsDto {
  lessonIds: Types.ObjectId[];
}
