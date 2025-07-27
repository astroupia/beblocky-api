import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserType {
  TEACHER = 'teacher',
  ADMIN = 'admin',
  ORGANIZATION = 'organization',
}

export enum CertificateType {
  COMPLETION = 'completion',
  ACHIEVEMENT = 'achievement',
  EXCELLENCE = 'excellence',
}

// Certificate data interface
export interface CertificateData {
  title: string;
  studentName: string;
  courseName: string;
  completionPercentage: number;
  grade?: string;
  instructorName?: string;
  organizationName?: string;
}

// Issuer interface
export interface CertificateIssuer {
  userId: string; // String ID from better-auth
  userType: UserType;
}

// Certificate metadata interface
export interface CertificateMetadata {
  certificateType: CertificateType;
  template: string;
  language: string;
}

// Domain entity
export class Certificate {
  certificateId: string;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  progressId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  issuedBy: CertificateIssuer;
  issuedAt: Date;
  completionDate: Date;
  certificateData: CertificateData;
  certificateUrl?: string;
  isActive: boolean;
  expiresAt?: Date;
  metadata?: CertificateMetadata;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'certificates' })
export class CertificateSchemaClass {
  @Prop({ required: true, unique: true })
  certificateId: string;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Progress', required: true })
  progressId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  @Prop({
    type: {
      userId: { type: String, ref: 'User', required: true },
      userType: { type: String, enum: Object.values(UserType), required: true },
    },
    required: true,
  })
  issuedBy: CertificateIssuer;

  @Prop({ required: true, default: Date.now })
  issuedAt: Date;

  @Prop({ required: true })
  completionDate: Date;

  @Prop({
    type: {
      title: { type: String, required: true },
      studentName: { type: String, required: true },
      courseName: { type: String, required: true },
      completionPercentage: { type: Number, required: true },
      grade: String,
      instructorName: String,
      organizationName: String,
    },
    required: true,
  })
  certificateData: CertificateData;

  @Prop()
  certificateUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  expiresAt?: Date;

  @Prop({
    type: {
      certificateType: {
        type: String,
        enum: Object.values(CertificateType),
        default: CertificateType.COMPLETION,
      },
      template: { type: String, default: 'default' },
      language: { type: String, default: 'en' },
    },
  })
  metadata?: CertificateMetadata;
}

export const CertificateSchema = SchemaFactory.createForClass(
  CertificateSchemaClass,
);

// Create indexes for common queries
CertificateSchema.index({ studentId: 1 });
CertificateSchema.index({ courseId: 1 });
CertificateSchema.index({ progressId: 1 });
CertificateSchema.index({ organizationId: 1 });
CertificateSchema.index({ 'issuedBy.userId': 1, 'issuedBy.userType': 1 });
CertificateSchema.index({ issuedAt: 1 });
CertificateSchema.index({ isActive: 1 });
CertificateSchema.index({ expiresAt: 1 });

export type CertificateDocument = CertificateSchemaClass & Document;
