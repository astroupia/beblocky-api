import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ICourseRating } from '../../types';

// Domain entity
export interface CourseRating
  extends Omit<ICourseRating, 'createdAt' | 'updatedAt'> {
  courseId: Types.ObjectId;
  userId: string | null; // String ID from better-auth, can be null
  rating: number; // Use number instead of RatingValue enum
  review?: string;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'course_ratings' })
export class CourseRatingSchemaClass implements CourseRating {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: String, ref: 'User', required: false })
  userId: string | null;

  @Prop({
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({ type: String, maxlength: 1000 })
  review?: string;
}

export const CourseRatingSchema = SchemaFactory.createForClass(
  CourseRatingSchemaClass,
);

// Compound index to ensure one rating per user per course
CourseRatingSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export type CourseRatingDocument = CourseRatingSchemaClass & Document;
