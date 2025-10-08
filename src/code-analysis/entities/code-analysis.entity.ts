import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Feedback types for code analysis
export enum FeedbackType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

export interface CodeFeedback {
  type: FeedbackType;
  message: string;
  line?: number;
  code?: string;
  suggestion?: string;
  points?: number;
}

// Domain entity
export class CodeAnalysis {
  progressId: Types.ObjectId;
  lessonId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  codeContent: string;
  language: string;
  feedback: CodeFeedback[];
  totalPoints: number;
  analysisDate: Date;
  isCompleted: boolean;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'code_analyses' })
export class CodeAnalysisSchemaClass {
  @Prop({ type: Types.ObjectId, ref: 'Progress', required: true })
  progressId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true })
  codeContent: string;

  @Prop({ required: true })
  language: string;

  @Prop({
    type: [
      {
        type: {
          type: String,
          enum: Object.values(FeedbackType),
          required: true,
        },
        message: { type: String, required: true },
        line: Number,
        code: String,
        suggestion: String,
        points: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  feedback: CodeFeedback[];

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: Date.now })
  analysisDate: Date;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const CodeAnalysisSchema = SchemaFactory.createForClass(
  CodeAnalysisSchemaClass,
);

// Add indexes for efficient queries
CodeAnalysisSchema.index({ progressId: 1 });
CodeAnalysisSchema.index({ lessonId: 1 });
CodeAnalysisSchema.index({ studentId: 1 });
CodeAnalysisSchema.index({ analysisDate: -1 });

export type CodeAnalysisDocument = CodeAnalysisSchemaClass & Document;
