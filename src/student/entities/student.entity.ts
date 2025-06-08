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
export interface Student extends User {
  dateOfBirth?: Date;
  grade?: number;
  gender?: Gender;
  schoolId?: Types.ObjectId;
  parentId?: Types.ObjectId;
  enrolledCourses: Types.ObjectId[];
  coins: number;
  goals?: string[];
  subscription?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'students' })
export class StudentSchemaClass extends UserSchemaClass implements Student {
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

  @Prop({ type: [String], default: [] })
  goals?: string[];

  @Prop()
  subscription?: string;

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
StudentSchema.pre('save', function (next) {
  this.role = UserRole.STUDENT;
  next();
});

export type StudentDocument = StudentSchemaClass & Document;
