import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Lesson {
  title: string;
  description?: string;
  course: Types.ObjectId;
  slides: Types.ObjectId[];
}

// Mongoose schema class
@Schema({ timestamps: true })
export class LessonSchemaClass {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Slide' }] })
  slides: Types.ObjectId[];
}

export const LessonSchema = SchemaFactory.createForClass(LessonSchemaClass);
export type LessonDocument = LessonSchemaClass & Document;
