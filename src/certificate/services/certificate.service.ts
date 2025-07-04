import {
  Injectable,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { CertificateRepository } from '../repositories/certificate.repository';
import {
  Certificate,
  CertificateDocument,
  UserType,
  CertificateType,
} from '../entities/certificate.entity';
import { IssueCertificateDto } from '../dtos/issue-certificate.dto';
import { BulkIssueCertificateDto } from '../dtos/bulk-issue-certificate.dto';
import { StudentService } from '../../student/services/student.service';
import { CourseService } from '../../course/services/course.service';
import { ProgressService } from '../../progress/services/progress.service';
import { OrganizationService } from '../../organization/services/organization.service';
import { CloudinaryService } from '../../cloudinary/services/cloudinary.service';
import { Types } from 'mongoose';

@Injectable()
export class CertificateService {
  constructor(
    private readonly certificateRepository: CertificateRepository,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => ProgressService))
    private readonly progressService: ProgressService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => CloudinaryService))
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Generate unique certificate ID
   */
  private generateCertificateId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `CERT-${year}-${random}`;
  }

  /**
   * Validate completion before issuing certificate
   */
  async validateCompletion(
    studentId: string,
    courseId: string,
  ): Promise<boolean> {
    try {
      const progress = await this.progressService.getCompletionPercentage(
        studentId,
        courseId,
      );
      return progress.percentage >= 100; // Must be 100% complete
    } catch (error) {
      return false; // Progress record doesn't exist or other error
    }
  }

  /**
   * Build certificate data
   */
  async buildCertificateData(issueData: IssueCertificateDto): Promise<any> {
    const student = await this.studentService.findOne(issueData.studentId);
    const course = await this.courseService.findById(issueData.courseId);

    let organizationName: string | undefined;
    if (issueData.organizationId) {
      const organization = await this.organizationService.findById(
        issueData.organizationId,
      );
      organizationName = organization.name;
    }

    const progress = await this.progressService.getCompletionPercentage(
      issueData.studentId,
      issueData.courseId,
    );

    return {
      title: 'Certificate of Completion',
      studentName: student.name,
      courseName: course.courseTitle,
      completionPercentage:
        issueData.completionPercentage || progress.percentage,
      grade: issueData.grade,
      instructorName: issueData.instructorName,
      organizationName,
    };
  }

  /**
   * Generate certificate PDF (placeholder - would integrate with PDF generation library)
   */
  async generateCertificatePDF(certificateData: any): Promise<string> {
    // This is a placeholder - in a real implementation, you would:
    // 1. Use a library like PDFKit, Puppeteer, or similar
    // 2. Create a certificate template
    // 3. Generate PDF with certificate data
    // 4. Upload to cloud storage

    // For now, we'll return a placeholder URL
    const pdfBuffer = Buffer.from('Certificate PDF placeholder');
    const certificateUrl = await this.cloudinaryService.uploadBuffer(
      pdfBuffer,
      'certificates',
    );

    return certificateUrl;
  }

  /**
   * Issue single certificate
   */
  async issueCertificate(
    issueData: IssueCertificateDto,
    issuerId: string,
    issuerType: UserType,
  ): Promise<CertificateDocument> {
    // Validate completion
    const isCompleted = await this.validateCompletion(
      issueData.studentId,
      issueData.courseId,
    );
    if (!isCompleted) {
      throw new BadRequestException(
        'Student has not completed the course (100% required)',
      );
    }

    // Check if certificate already exists
    const existingCertificate =
      await this.certificateRepository.findByStudentAndCourse(
        issueData.studentId,
        issueData.courseId,
      );
    if (existingCertificate) {
      throw new BadRequestException(
        'Certificate already exists for this student and course',
      );
    }

    // Validate entities exist
    await this.studentService.findOne(issueData.studentId);
    await this.courseService.findById(issueData.courseId);
    await this.progressService.findByStudentAndCourse(
      issueData.studentId,
      issueData.courseId,
    );

    if (issueData.organizationId) {
      await this.organizationService.findById(issueData.organizationId);
    }

    // Generate unique certificate ID
    const certificateId = this.generateCertificateId();

    // Build certificate data
    const certificateData = await this.buildCertificateData(issueData);

    // Generate PDF (placeholder)
    const certificateUrl = await this.generateCertificatePDF(certificateData);

    // Create certificate record
    const certificate = await this.certificateRepository.create({
      certificateId,
      studentId: new Types.ObjectId(issueData.studentId),
      courseId: new Types.ObjectId(issueData.courseId),
      progressId: new Types.ObjectId(issueData.progressId),
      organizationId: issueData.organizationId
        ? new Types.ObjectId(issueData.organizationId)
        : undefined,
      issuedBy: {
        userId: new Types.ObjectId(issuerId),
        userType: issuerType,
      },
      issuedAt: new Date(),
      completionDate: new Date(),
      certificateData,
      certificateUrl,
      isActive: true,
      metadata: {
        certificateType: CertificateType.COMPLETION,
        template: 'default',
        language: 'en',
      },
    });

    return certificate;
  }

  /**
   * Issue certificates in bulk
   */
  async bulkIssueCertificates(
    bulkData: BulkIssueCertificateDto,
    issuerId: string,
    issuerType: UserType,
  ): Promise<{
    totalRequested: number;
    totalIssued: number;
    totalSkipped: number;
    certificates: CertificateDocument[];
    errors: string[];
  }> {
    const {
      courseId,
      studentIds,
      organizationId,
      instructorName,
      completionPercentage,
    } = bulkData;
    const certificates: CertificateDocument[] = [];
    const errors: string[] = [];

    for (const studentId of studentIds) {
      try {
        // Check if certificate already exists
        const existingCertificate =
          await this.certificateRepository.findByStudentAndCourse(
            studentId,
            courseId,
          );
        if (existingCertificate) {
          errors.push(`Certificate already exists for student ${studentId}`);
          continue;
        }

        // Get progress record
        const progress = await this.progressService.findByStudentAndCourse(
          studentId,
          courseId,
        );

        const certificate = await this.issueCertificate(
          {
            studentId,
            courseId,
            progressId: (progress as any)._id.toString(),
            organizationId,
            instructorName,
            completionPercentage,
          },
          issuerId,
          issuerType,
        );

        certificates.push(certificate);
      } catch (error) {
        errors.push(
          `Failed to issue certificate for student ${studentId}: ${(error as Error).message}`,
        );
      }
    }

    return {
      totalRequested: studentIds.length,
      totalIssued: certificates.length,
      totalSkipped: studentIds.length - certificates.length - errors.length,
      certificates,
      errors,
    };
  }

  /**
   * Get certificate by ID
   */
  async findById(id: string): Promise<CertificateDocument> {
    return this.certificateRepository.findById(id);
  }

  /**
   * Get certificate by certificate ID
   */
  async findByCertificateId(
    certificateId: string,
  ): Promise<CertificateDocument> {
    return this.certificateRepository.findByCertificateId(certificateId);
  }

  /**
   * Get all certificates
   */
  async findAll(): Promise<CertificateDocument[]> {
    return this.certificateRepository.findAll();
  }

  /**
   * Get certificates by student
   */
  async findByStudent(studentId: string): Promise<CertificateDocument[]> {
    return this.certificateRepository.findByStudent(studentId);
  }

  /**
   * Get certificates by course
   */
  async findByCourse(courseId: string): Promise<CertificateDocument[]> {
    return this.certificateRepository.findByCourse(courseId);
  }

  /**
   * Get certificates by organization
   */
  async findByOrganization(
    organizationId: string,
  ): Promise<CertificateDocument[]> {
    return this.certificateRepository.findByOrganization(organizationId);
  }

  /**
   * Get certificates by issuer
   */
  async findByIssuer(
    issuerId: string,
    issuerType: string,
  ): Promise<CertificateDocument[]> {
    return this.certificateRepository.findByIssuer(issuerId, issuerType);
  }

  /**
   * Validate certificate authenticity
   */
  async validateCertificate(certificateId: string): Promise<{
    isValid: boolean;
    certificate?: CertificateDocument;
    error?: string;
  }> {
    try {
      const certificate = await this.findByCertificateId(certificateId);

      if (!certificate.isActive) {
        return { isValid: false, error: 'Certificate has been revoked' };
      }

      if (certificate.expiresAt && new Date() > certificate.expiresAt) {
        return { isValid: false, error: 'Certificate has expired' };
      }

      return { isValid: true, certificate };
    } catch (error) {
      return { isValid: false, error: 'Certificate not found' };
    }
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(
    certificateId: string,
    reason?: string,
  ): Promise<CertificateDocument> {
    const certificate = await this.findByCertificateId(certificateId);

    if (!certificate.isActive) {
      throw new BadRequestException('Certificate is already revoked');
    }

    return this.certificateRepository.updateActiveStatus(
      (certificate as any)._id.toString(),
      false,
    );
  }

  /**
   * Delete certificate
   */
  async delete(id: string): Promise<void> {
    await this.certificateRepository.findByIdAndDelete(id);
  }

  /**
   * Get certificate statistics
   */
  async getCertificateStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byType: { [key: string]: number };
  }> {
    return this.certificateRepository.getCertificateStats();
  }

  /**
   * Update expired certificates
   */
  async updateExpiredCertificates(): Promise<void> {
    const expiredCertificates =
      await this.certificateRepository.findExpiredCertificates();

    for (const certificate of expiredCertificates) {
      await this.certificateRepository.updateActiveStatus(
        (certificate as any)._id.toString(),
        false,
      );
    }
  }
}
