import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Slide {
  title: string;
  content: string;
  courseId: Types.ObjectId;
  lessonId: Types.ObjectId;
  titleFont?: string;
  startingCode?: string;
  solutionCode?: string;
  imageUrls: string[];
  backgroundColor: string;
  textColor: string;
  themeColors: {
    main: string;
    secondary: string;
  };
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'slides' })
export class SlideSchemaClass {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lesson?: Types.ObjectId;

  @Prop({ required: true, default: 'Arial' })
  titleFont: string;

  @Prop()
  startingCode?: string;

  @Prop()
  solutionCode?: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ required: true, default: '#FFFFFF' })
  backgroundColor: string;

  @Prop({ required: true, default: '#000000' })
  textColor: string;

  @Prop({
    type: {
      main: { type: String, required: true, default: '#000000' },
      secondary: { type: String, required: true, default: '#FFFFFF' },
    },
    required: true,
  })
  themeColors: {
    main: string;
    secondary: string;
  };
}

export const SlideSchema = SchemaFactory.createForClass(SlideSchemaClass);
export type SlideDocument = SlideSchemaClass & Document;
