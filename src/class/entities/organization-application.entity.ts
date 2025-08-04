import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Domain entity
export class OrganizationApplication {
  studentId: Types.ObjectId;
  organizationId: Types.ObjectId;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  notes?: string;
  rejectionReason?: string;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'organization_applications' })
export class OrganizationApplicationSchemaClass {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ApplicationStatus),
    required: true,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Prop({ required: true, default: Date.now })
  appliedAt: Date;

  @Prop()
  reviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop()
  rejectionReason?: string;
}

export const OrganizationApplicationSchema = SchemaFactory.createForClass(
  OrganizationApplicationSchemaClass,
);

// Create compound unique index for studentId + organizationId
OrganizationApplicationSchema.index(
  { studentId: 1, organizationId: 1 },
  { unique: true },
);

// Create indexes for common queries
OrganizationApplicationSchema.index({ studentId: 1 });
OrganizationApplicationSchema.index({ organizationId: 1 });
OrganizationApplicationSchema.index({ status: 1 });
OrganizationApplicationSchema.index({ appliedAt: 1 });

export type OrganizationApplicationDocument =
  OrganizationApplicationSchemaClass & Document;
