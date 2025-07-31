import { Types } from 'mongoose';
import { UserType, CertificateType } from '../entities/certificate.entity';

export class CertificateResponseDto {
  id: string;
  certificateId: string;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  progressId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  issuedBy: {
    userId: Types.ObjectId;
    userType: UserType;
  };
  issuedAt: Date;
  completionDate: Date;
  certificateData: {
    title: string;
    studentName: string;
    courseName: string;
    completionPercentage: number;
    grade?: string;
    instructorName?: string;
    organizationName?: string;
  };
  certificateUrl?: string;
  isActive: boolean;
  expiresAt?: Date;
  metadata?: {
    certificateType: CertificateType;
    template: string;
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class CertificateValidationResponseDto {
  isValid: boolean;
  certificate?: CertificateResponseDto;
  error?: string;
}

export class BulkIssueResponseDto {
  totalRequested: number;
  totalIssued: number;
  totalSkipped: number;
  certificates: CertificateResponseDto[];
  errors: string[];
}
