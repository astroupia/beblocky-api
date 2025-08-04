import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CertificateService } from '../services/certificate.service';
import { IssueCertificateDto } from '../dtos/issue-certificate.dto';
import { BulkIssueCertificateDto } from '../dtos/bulk-issue-certificate.dto';
import {
  CertificateResponseDto,
  CertificateValidationResponseDto,
  BulkIssueResponseDto,
} from '../dtos/certificate-response.dto';
import { UserType } from '../entities/certificate.entity';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /**
   * Issue a single certificate
   * POST /certificates/issue
   */
  @Post('issue')
  @HttpCode(HttpStatus.CREATED)
  async issueCertificate(
    @Body() issueData: IssueCertificateDto,
    @Request() req: any,
  ): Promise<CertificateResponseDto> {
    // Extract issuer info from request (assuming JWT payload)
    const issuerId = req.user?.id;
    const issuerType = req.user?.role as UserType;

    if (!issuerId || !issuerType) {
      throw new Error('Invalid issuer information');
    }

    const certificate = await this.certificateService.issueCertificate(
      issueData,
      issuerId,
      issuerType,
    );

    return this.mapToResponseDto(certificate);
  }

  /**
   * Issue certificates in bulk
   * POST /certificates/bulk-issue
   */
  @Post('bulk-issue')
  @HttpCode(HttpStatus.CREATED)
  async bulkIssueCertificates(
    @Body() bulkData: BulkIssueCertificateDto,
    @Request() req: any,
  ): Promise<BulkIssueResponseDto> {
    const issuerId = req.user?.id;
    const issuerType = req.user?.role as UserType;

    if (!issuerId || !issuerType) {
      throw new Error('Invalid issuer information');
    }

    const result = await this.certificateService.bulkIssueCertificates(
      bulkData,
      issuerId,
      issuerType,
    );

    return {
      totalRequested: result.totalRequested,
      totalIssued: result.totalIssued,
      totalSkipped: result.totalSkipped,
      certificates: result.certificates.map((cert) =>
        this.mapToResponseDto(cert),
      ),
      errors: result.errors,
    };
  }

  /**
   * Get all certificates
   * GET /certificates
   */
  @Get()
  async getAllCertificates(): Promise<CertificateResponseDto[]> {
    const certificates = await this.certificateService.findAll();
    return certificates.map((cert) => this.mapToResponseDto(cert));
  }

  /**
   * Get certificate by ID
   * GET /certificates/:id
   */
  @Get(':id')
  async getCertificateById(
    @Param('id') id: string,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.findById(id);
    return this.mapToResponseDto(certificate);
  }

  /**
   * Get certificate by certificate ID
   * GET /certificates/certificate/:certificateId
   */
  @Get('certificate/:certificateId')
  async getCertificateByCertificateId(
    @Param('certificateId') certificateId: string,
  ): Promise<CertificateResponseDto> {
    const certificate =
      await this.certificateService.findByCertificateId(certificateId);
    return this.mapToResponseDto(certificate);
  }

  /**
   * Get certificates by student
   * GET /certificates/student/:studentId
   */
  @Get('student/:studentId')
  async getCertificatesByStudent(
    @Param('studentId') studentId: string,
  ): Promise<CertificateResponseDto[]> {
    const certificates = await this.certificateService.findByStudent(studentId);
    return certificates.map((cert) => this.mapToResponseDto(cert));
  }

  /**
   * Get certificates by course
   * GET /certificates/course/:courseId
   */
  @Get('course/:courseId')
  async getCertificatesByCourse(
    @Param('courseId') courseId: string,
  ): Promise<CertificateResponseDto[]> {
    const certificates = await this.certificateService.findByCourse(courseId);
    return certificates.map((cert) => this.mapToResponseDto(cert));
  }

  /**
   * Get certificates by organization
   * GET /certificates/organization/:organizationId
   */
  @Get('organization/:organizationId')
  async getCertificatesByOrganization(
    @Param('organizationId') organizationId: string,
  ): Promise<CertificateResponseDto[]> {
    const certificates =
      await this.certificateService.findByOrganization(organizationId);
    return certificates.map((cert) => this.mapToResponseDto(cert));
  }

  /**
   * Get certificates by issuer
   * GET /certificates/issuer/:issuerId
   */
  @Get('issuer/:issuerId')
  async getCertificatesByIssuer(
    @Param('issuerId') issuerId: string,
    @Query('issuerType') issuerType: string,
  ): Promise<CertificateResponseDto[]> {
    const certificates = await this.certificateService.findByIssuer(
      issuerId,
      issuerType,
    );
    return certificates.map((cert) => this.mapToResponseDto(cert));
  }

  /**
   * Validate certificate authenticity
   * GET /certificates/validate/:certificateId
   */
  @Get('validate/:certificateId')
  async validateCertificate(
    @Param('certificateId') certificateId: string,
  ): Promise<CertificateValidationResponseDto> {
    const result =
      await this.certificateService.validateCertificate(certificateId);

    return {
      isValid: result.isValid,
      certificate: result.certificate
        ? this.mapToResponseDto(result.certificate)
        : undefined,
      error: result.error,
    };
  }

  /**
   * Revoke certificate
   * PUT /certificates/:id/revoke
   */
  @Put(':id/revoke')
  async revokeCertificate(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateService.revokeCertificate(
      id,
      body.reason,
    );
    return this.mapToResponseDto(certificate);
  }

  /**
   * Delete certificate
   * DELETE /certificates/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCertificate(@Param('id') id: string): Promise<void> {
    await this.certificateService.delete(id);
  }

  /**
   * Get certificate statistics
   * GET /certificates/stats
   */
  @Get('stats')
  async getCertificateStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byType: { [key: string]: number };
  }> {
    return this.certificateService.getCertificateStats();
  }

  /**
   * Update expired certificates (admin only)
   * PUT /certificates/update-expired
   */
  @Put('update-expired')
  @HttpCode(HttpStatus.OK)
  async updateExpiredCertificates(): Promise<{ message: string }> {
    await this.certificateService.updateExpiredCertificates();
    return { message: 'Expired certificates updated successfully' };
  }

  /**
   * Helper method to map certificate document to response DTO
   */
  private mapToResponseDto(certificate: any): CertificateResponseDto {
    return {
      id: certificate._id.toString(),
      certificateId: certificate.certificateId,
      studentId: certificate.studentId,
      courseId: certificate.courseId,
      progressId: certificate.progressId,
      organizationId: certificate.organizationId,
      issuedBy: certificate.issuedBy,
      issuedAt: certificate.issuedAt,
      completionDate: certificate.completionDate,
      certificateData: certificate.certificateData,
      certificateUrl: certificate.certificateUrl,
      isActive: certificate.isActive,
      expiresAt: certificate.expiresAt,
      metadata: certificate.metadata,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt,
    };
  }
}
