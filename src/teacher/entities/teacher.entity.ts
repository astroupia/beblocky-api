import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  User,
  UserRole,
  UserSchemaClass,
} from '../../user/entities/user.entity';

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  specialization: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// Domain entity
export interface Teacher {
  userId: string; // String ID from better-auth
  qualifications: Qualification[];
  availability: Record<string, TimeSlot[]>;
  rating: number[];
  courses: Types.ObjectId[];
  organizationId?: Types.ObjectId;
  languages: string[];
  subscription?: Types.ObjectId;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'teachers' })
export class TeacherSchemaClass implements Teacher {
  @Prop({ type: String, required: true })
  userId: string; // String ID from better-auth

  @Prop({
    type: [
      {
        degree: String,
        institution: String,
        year: Number,
        specialization: String,
      },
    ],
    default: [],
  })
  qualifications: Qualification[];

  @Prop({
    type: Object,
    default: {},
  })
  availability: Record<string, TimeSlot[]>;

  @Prop({ type: [Number], default: [0] })
  rating: number[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  courses: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: false })
  organizationId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscription?: Types.ObjectId;
}

export const TeacherSchema = SchemaFactory.createForClass(TeacherSchemaClass);

// Create indexes for common queries
TeacherSchema.index({ userId: 1 }, { unique: true });
TeacherSchema.index({ organizationId: 1 });
TeacherSchema.index({ courses: 1 });

export type TeacherDocument = TeacherSchemaClass & Document;
