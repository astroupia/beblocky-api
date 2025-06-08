import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { OrganizationDocument } from '../entities/organization.entity';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationDocument> {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrganizationDocument> {
    return this.organizationService.findById(id);
  }

  @Get()
  findAll(): Promise<OrganizationDocument[]> {
    return this.organizationService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationDocument> {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.organizationService.delete(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string): Promise<OrganizationDocument> {
    return this.organizationService.findByEmail(email);
  }
}
