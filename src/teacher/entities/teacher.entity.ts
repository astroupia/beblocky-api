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
export interface Teacher extends User {
  qualifications: Qualification[];
  availability: Map<string, TimeSlot[]>;
  rating: number[];
  courses: Types.ObjectId[];
  organizationId: Types.ObjectId;
  languages: string[];
  subscription?: Types.ObjectId;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'teachers' })
export class TeacherSchemaClass extends UserSchemaClass implements Teacher {
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
    type: Map,
    of: [
      {
        startTime: String,
        endTime: String,
      },
    ],
    default: new Map(),
  })
  availability: Map<string, TimeSlot[]>;

  @Prop({ type: [Number], default: [0] })
  rating: number[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  courses: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscription?: Types.ObjectId;
}

export const TeacherSchema = SchemaFactory.createForClass(TeacherSchemaClass);
TeacherSchema.pre('save', function (next) {
  this.role = UserRole.TEACHER;
  next();
});

export type TeacherDocument = TeacherSchemaClass & Document;
