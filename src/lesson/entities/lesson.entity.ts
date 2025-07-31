import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LessonDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

// Domain entity
export class Lesson {
  title: string;
  description?: string;
  courseId: Types.ObjectId;
  slides: Types.ObjectId[];
  difficulty: LessonDifficulty;
  duration: number;
  tags: string[];
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'lessons' })
export class LessonSchemaClass {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Slide' }] })
  slides: Types.ObjectId[];

  @Prop({
    type: String,
    enum: Object.values(LessonDifficulty),
    required: true,
    default: LessonDifficulty.BEGINNER,
  })
  difficulty: LessonDifficulty;

  @Prop({ required: true, min: 0 })
  duration: number;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const LessonSchema = SchemaFactory.createForClass(LessonSchemaClass);
export type LessonDocument = LessonSchemaClass & Document;
