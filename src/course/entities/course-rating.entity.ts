import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RatingValue, ICourseRating } from '../../types';

// Domain entity
export interface CourseRating
  extends Omit<ICourseRating, 'createdAt' | 'updatedAt'> {
  courseId: Types.ObjectId;
  userId: string; // String ID from better-auth
  rating: RatingValue;
  review?: string;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'course_ratings' })
export class CourseRatingSchemaClass implements CourseRating {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: String, ref: 'User', required: true })
  userId: string;

  @Prop({
    type: Number,
    enum: Object.values(RatingValue),
    required: true,
    min: 1,
    max: 5,
  })
  rating: RatingValue;

  @Prop({ type: String, maxlength: 1000 })
  review?: string;
}

export const CourseRatingSchema = SchemaFactory.createForClass(
  CourseRatingSchemaClass,
);

// Compound index to ensure one rating per user per course
CourseRatingSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export type CourseRatingDocument = CourseRatingSchemaClass & Document;
