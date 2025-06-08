import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrganizationType {
  SCHOOL = 'school',
  UNIVERSITY = 'university',
  TRAINING_CENTER = 'training_center',
  OTHER = 'other',
}

export enum RelationshipType {
  MOTHER = 'mother',
  FATHER = 'father',
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

// Domain entity
export class Organization {
  name: string;
  type: OrganizationType;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    website: string;
    email: string;
  };
  teachers: Types.ObjectId[];
  students: Types.ObjectId[];
  courses: Types.ObjectId[];
  subscription: Types.ObjectId;
  paymentHistory: Types.ObjectId[];
  features: {
    hasStudentTracking: boolean;
    hasProgressTracking: boolean;
    hasLeaderboard: boolean;
  };
  settings: {
    timezone: string;
    language: string;
    academicYear: {
      startDate: Date;
      endDate: Date;
    };
  };
  isVerified: boolean;
  businessLicenseNumber?: string;
  accreditation?: string[];
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'organizations' })
export class OrganizationSchemaClass {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    enum: Object.values(OrganizationType),
    required: true,
  })
  type: OrganizationType;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    required: true,
  })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({
    type: {
      phone: String,
      website: String,
      email: String,
    },
    required: true,
  })
  contactInfo: {
    phone: string;
    website: string;
    email: string;
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Teacher' }] })
  teachers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  students: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
  courses: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscription: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Payment' }] })
  paymentHistory: Types.ObjectId[];

  @Prop({
    type: {
      hasStudentTracking: { type: Boolean, default: false },
      hasProgressTracking: { type: Boolean, default: false },
      hasLeaderboard: { type: Boolean, default: false },
    },
    default: {
      hasStudentTracking: false,
      hasProgressTracking: false,
      hasLeaderboard: false,
    },
  })
  features: {
    hasStudentTracking: boolean;
    hasProgressTracking: boolean;
    hasLeaderboard: boolean;
  };

  @Prop({
    type: {
      timezone: String,
      language: { type: String, default: 'en' },
      academicYear: {
        startDate: Date,
        endDate: Date,
      },
    },
  })
  settings: {
    timezone: string;
    language: string;
    academicYear: {
      startDate: Date;
      endDate: Date;
    };
  };

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  businessLicenseNumber?: string;

  @Prop({ type: [String] })
  accreditation?: string[];
}

export const OrganizationSchema = SchemaFactory.createForClass(
  OrganizationSchemaClass,
);
export type OrganizationDocument = OrganizationSchemaClass & Document;
