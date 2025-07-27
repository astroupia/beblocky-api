import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  User,
  UserRole,
  UserSchemaClass,
} from '../../user/entities/user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// Domain entity
export interface Student {
  userId: string; // String ID from better-auth
  dateOfBirth?: Date;
  grade?: number;
  gender?: Gender;
  schoolId?: Types.ObjectId;
  parentId?: Types.ObjectId;
  enrolledCourses: Types.ObjectId[];
  coins: number;
  codingStreak: number; // Current coding streak
  lastCodingActivity: Date; // Last coding activity for streak
  totalCoinsEarned: number; // Total coins earned across all courses
  totalTimeSpent: number; // Total learning time in minutes
  goals?: string[];
  subscription?: string;
  section?: string; // Class section (e.g., "A", "B", "1A")
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'students' })
export class StudentSchemaClass implements Student {
  @Prop({ type: String, required: true })
  userId: string; // String ID from better-auth

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  grade?: number;

  @Prop({ enum: Gender })
  gender?: Gender;

  @Prop({ type: Types.ObjectId, ref: 'School' })
  schoolId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  parentId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  enrolledCourses: Types.ObjectId[];

  @Prop({ default: 0 })
  coins: number;

  @Prop({ default: 0 })
  codingStreak: number;

  @Prop({ default: null })
  lastCodingActivity: Date;

  @Prop({ default: 0 })
  totalCoinsEarned: number;

  @Prop({ default: 0 })
  totalTimeSpent: number;

  @Prop({ type: [String], default: [] })
  goals?: string[];

  @Prop()
  subscription?: string;

  @Prop()
  section?: string;

  @Prop({
    type: {
      name: String,
      relationship: String,
      phone: String,
    },
  })
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const StudentSchema = SchemaFactory.createForClass(StudentSchemaClass);

export type StudentDocument = StudentSchemaClass & Document;
