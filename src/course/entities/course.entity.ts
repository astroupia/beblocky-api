import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Course {
  title: string;
  description?: string;
  lessons: Types.ObjectId[];
  slides: Types.ObjectId[];
}

// Mongoose schema class
@Schema({ timestamps: true })
export class CourseSchemaClass {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }] })
  lessons: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Slide' }] })
  slides: Types.ObjectId[];
}

export const CourseSchema = SchemaFactory.createForClass(CourseSchemaClass);
export type CourseDocument = CourseSchemaClass & Document;
