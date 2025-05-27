import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Slide {
  title: string;
  content?: string;
  course: Types.ObjectId;
  lesson?: Types.ObjectId;
  order: number;
}

// Mongoose schema class
@Schema({ timestamps: true })
export class SlideSchemaClass {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lesson?: Types.ObjectId;

  @Prop()
  order: number;
}

export const SlideSchema = SchemaFactory.createForClass(SlideSchemaClass);
export type SlideDocument = SlideSchemaClass & Document;
