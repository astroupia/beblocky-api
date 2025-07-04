import {
  Injectable,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationApplicationRepository } from '../repositories/organization-application.repository';
import {
  OrganizationApplication,
  OrganizationApplicationDocument,
  ApplicationStatus,
} from '../entities/organization-application.entity';
import { CreateApplicationDto } from '../dtos/create-application.dto';
import { ReviewApplicationDto } from '../dtos/review-application.dto';
import { StudentService } from '../../student/services/student.service';
import { OrganizationService } from '../../organization/services/organization.service';
import { Types } from 'mongoose';

@Injectable()
export class OrganizationApplicationService {
  constructor(
    private readonly applicationRepository: OrganizationApplicationRepository,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Student applies to organization
   */
  async applyToOrganization(
    studentId: string,
    createApplicationDto: CreateApplicationDto,
  ): Promise<OrganizationApplicationDocument> {
    const { organizationId } = createApplicationDto;

    // Check if application already exists
    const existingApplication =
      await this.applicationRepository.findByStudentAndOrganization(
        studentId,
        organizationId,
      );
    if (existingApplication) {
      throw new BadRequestException(
        'Application already exists for this organization',
      );
    }

    // Validate student and organization exist
    await this.studentService.findOne(studentId);
    await this.organizationService.findById(organizationId);

    const applicationData: Partial<OrganizationApplication> = {
      studentId: new Types.ObjectId(studentId),
      organizationId: new Types.ObjectId(organizationId),
      status: ApplicationStatus.PENDING,
      appliedAt: new Date(),
    };

    return this.applicationRepository.create(applicationData);
  }

  /**
   * Get application by ID
   */
  async findById(id: string): Promise<OrganizationApplicationDocument> {
    return this.applicationRepository.findById(id);
  }

  /**
   * Get all applications
   */
  async findAll(): Promise<OrganizationApplicationDocument[]> {
    return this.applicationRepository.findAll();
  }

  /**
   * Get applications by student
   */
  async findByStudent(
    studentId: string,
  ): Promise<OrganizationApplicationDocument[]> {
    return this.applicationRepository.findByStudent(studentId);
  }

  /**
   * Get applications by organization
   */
  async findByOrganization(
    organizationId: string,
  ): Promise<OrganizationApplicationDocument[]> {
    return this.applicationRepository.findByOrganization(organizationId);
  }

  /**
   * Get applications by status
   */
  async findByStatus(
    status: string,
  ): Promise<OrganizationApplicationDocument[]> {
    return this.applicationRepository.findByStatus(status);
  }

  /**
   * Review application (approve/reject)
   */
  async reviewApplication(
    applicationId: string,
    reviewApplicationDto: ReviewApplicationDto,
    reviewerId: string,
  ): Promise<OrganizationApplicationDocument> {
    const { status, notes, rejectionReason } = reviewApplicationDto;
    const application = await this.findById(applicationId);

    // Validate status transition
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been reviewed');
    }

    // Validate rejection reason if status is rejected
    if (status === ApplicationStatus.REJECTED && !rejectionReason) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting an application',
      );
    }

    const updateData: Partial<OrganizationApplication> = {
      status,
      reviewedAt: new Date(),
      reviewedBy: new Types.ObjectId(reviewerId),
      notes,
      rejectionReason,
    };

    return this.applicationRepository.findByIdAndUpdate(
      applicationId,
      updateData,
    );
  }

  /**
   * Delete application (withdraw)
   */
  async delete(id: string): Promise<void> {
    const application = await this.findById(id);

    // Only allow withdrawal if application is still pending
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Cannot withdraw application that has been reviewed',
      );
    }

    await this.applicationRepository.findByIdAndDelete(id);
  }

  /**
   * Get application statistics for organization
   */
  async getApplicationStats(organizationId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return this.applicationRepository.getApplicationStats(organizationId);
  }

  /**
   * Check if student has pending application to organization
   */
  async hasPendingApplication(
    studentId: string,
    organizationId: string,
  ): Promise<boolean> {
    const application =
      await this.applicationRepository.findByStudentAndOrganization(
        studentId,
        organizationId,
      );
    return application !== null;
  }

  /**
   * Get application by student and organization
   */
  async findByStudentAndOrganization(
    studentId: string,
    organizationId: string,
  ): Promise<OrganizationApplicationDocument | null> {
    return this.applicationRepository.findByStudentAndOrganization(
      studentId,
      organizationId,
    );
  }
}
