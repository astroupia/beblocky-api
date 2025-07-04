import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ClassUserType {
  TEACHER = 'teacher',
  ADMIN = 'admin',
  PARENT = 'parent',
}

// Class settings interface
export interface ClassSettings {
  allowStudentEnrollment: boolean;
  requireApproval: boolean;
  autoProgress: boolean;
}

// Class metadata interface
export interface ClassMetadata {
  grade?: string;
  subject?: string;
  level?: string;
}

// Creator interface
export interface ClassCreator {
  userId: Types.ObjectId;
  userType: ClassUserType;
}

// Domain entity
export class Class {
  className: string;
  description?: string;
  createdBy: ClassCreator;
  organizationId?: Types.ObjectId;
  courses: Types.ObjectId[];
  students: Types.ObjectId[];
  maxStudents?: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  settings?: ClassSettings;
  metadata?: ClassMetadata;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'classes' })
export class ClassSchemaClass {
  @Prop({ required: true })
  className: string;

  @Prop()
  description?: string;

  @Prop({
    type: {
      userId: { type: Types.ObjectId, ref: 'User', required: true },
      userType: {
        type: String,
        enum: Object.values(ClassUserType),
        required: true,
      },
    },
    required: true,
  })
  createdBy: ClassCreator;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  courses: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }], default: [] })
  students: Types.ObjectId[];

  @Prop({ min: 1 })
  maxStudents?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({
    type: {
      allowStudentEnrollment: { type: Boolean, default: false },
      requireApproval: { type: Boolean, default: true },
      autoProgress: { type: Boolean, default: true },
    },
    default: {
      allowStudentEnrollment: false,
      requireApproval: true,
      autoProgress: true,
    },
  })
  settings?: ClassSettings;

  @Prop({
    type: {
      grade: String,
      subject: String,
      level: String,
    },
  })
  metadata?: ClassMetadata;
}

export const ClassSchema = SchemaFactory.createForClass(ClassSchemaClass);

// Create indexes for common queries
ClassSchema.index({ 'createdBy.userId': 1, 'createdBy.userType': 1 });
ClassSchema.index({ courses: 1 });
ClassSchema.index({ students: 1 });
ClassSchema.index({ organizationId: 1 });
ClassSchema.index({ isActive: 1 });
ClassSchema.index({ endDate: 1 });

export type ClassDocument = ClassSchemaClass & Document;
