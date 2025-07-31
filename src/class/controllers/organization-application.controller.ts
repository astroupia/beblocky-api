import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrganizationApplicationService } from '../services/organization-application.service';
import { CreateApplicationDto } from '../dtos/create-application.dto';
import { ReviewApplicationDto } from '../dtos/review-application.dto';

@Controller('applications')
export class OrganizationApplicationController {
  constructor(
    private readonly applicationService: OrganizationApplicationService,
  ) {}

  @Post()
  applyToOrganization(
    @Body() createApplicationDto: CreateApplicationDto,
    @Query('studentId') studentId: string,
  ) {
    return this.applicationService.applyToOrganization(
      studentId,
      createApplicationDto,
    );
  }

  @Get()
  findAll() {
    return this.applicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationService.findById(id);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.applicationService.findByStudent(studentId);
  }

  @Get('organization/:organizationId')
  findByOrganization(@Param('organizationId') organizationId: string) {
    return this.applicationService.findByOrganization(organizationId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.applicationService.findByStatus(status);
  }

  @Get('organization/:organizationId/stats')
  getApplicationStats(@Param('organizationId') organizationId: string) {
    return this.applicationService.getApplicationStats(organizationId);
  }

  @Patch(':id/review')
  reviewApplication(
    @Param('id') id: string,
    @Body() reviewApplicationDto: ReviewApplicationDto,
    @Query('reviewerId') reviewerId: string,
  ) {
    return this.applicationService.reviewApplication(
      id,
      reviewApplicationDto,
      reviewerId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationService.delete(id);
  }
}
