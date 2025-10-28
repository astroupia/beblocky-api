import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Lesson completion interface
export interface LessonCompletion {
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent: number; // Minutes spent on this lesson
}

// Code storage interface
export interface LessonCode {
  language: string; // "html", "python", "javascript", "typescript"
  code: string;
  timestamp: Date;
}

// Domain entity
export class Progress {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  completedLessons: { [lessonId: string]: LessonCompletion };
  completionPercentage: number;
  timeSpent: { [weekKey: string]: number }; // "2024-W01" -> minutes
  coinsEarned: number;
  lessonCode: { [lessonId: string]: LessonCode };
  currentLesson?: Types.ObjectId;
  startedAt: Date;
  lastCompletedAt?: Date;
  isActive: boolean;
  lastCalculatedAt: Date;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'progress' })
export class ProgressSchemaClass {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({
    type: Map,
    of: {
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date },
      timeSpent: { type: Number, default: 0 },
    },
    default: {},
  })
  completedLessons: { [lessonId: string]: LessonCompletion };

  @Prop({ default: 0, min: 0, max: 100 })
  completionPercentage: number;

  @Prop({
    type: Map,
    of: Number,
    default: {},
  })
  timeSpent: { [weekKey: string]: number };

  @Prop({ default: 0, min: 0, required: false })
  coinsEarned?: number;

  @Prop({
    type: Map,
    of: {
      language: { type: String, required: true },
      code: { type: String, required: false },
      timestamp: { type: Date, default: Date.now },
    },
    default: {},
  })
  lessonCode: { [lessonId: string]: LessonCode };

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  currentLesson?: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  startedAt: Date;

  @Prop()
  lastCompletedAt?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, default: Date.now })
  lastCalculatedAt: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(ProgressSchemaClass);

// Create compound unique index for studentId + courseId
ProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Create indexes for common queries
ProgressSchema.index({ studentId: 1 });
ProgressSchema.index({ courseId: 1 });
ProgressSchema.index({ lastCompletedAt: 1 });

export type ProgressDocument = ProgressSchemaClass & Document;
