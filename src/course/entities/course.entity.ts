import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CourseSubscriptionType {
  FREE = 'free',
  STARTER = 'starter',
  BUILDER = 'builder',
  PRO = 'pro-bundle',
  ORGANIZATION = 'organization',
}

export enum CourseStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
}

// Domain entity
export class Course {
  courseTitle: string;
  courseDescription: string;
  courseLanguage: string;
  slides: Types.ObjectId[];
  lessons: Types.ObjectId[];
  students: Types.ObjectId[];
  subType: CourseSubscriptionType;
  status: CourseStatus;
  rating: number;
  school: Types.ObjectId;
  language: string;
}

// Mongoose schema class
@Schema({ timestamps: true })
export class CourseSchemaClass {
  @Prop({ required: true })
  courseTitle: string;

  @Prop({ required: true })
  courseDescription: string;

  @Prop({ required: true })
  courseLanguage: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Slide' }] })
  slides: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }] })
  lessons: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  students: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Organization' }] })
  organization: Types.ObjectId[];

  @Prop({
    type: String,
    enum: Object.values(CourseSubscriptionType),
    required: true,
    default: CourseSubscriptionType.FREE,
  })
  subType: CourseSubscriptionType;

  @Prop({
    type: String,
    enum: Object.values(CourseStatus),
    required: true,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Prop({ default: 0 })
  rating: number;

  @Prop()
  language: string;
}

export const CourseSchema = SchemaFactory.createForClass(CourseSchemaClass);
export type CourseDocument = CourseSchemaClass & Document;
