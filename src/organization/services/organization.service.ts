import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { OrganizationDocument } from '../entities/organization.entity';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationDocument> {
    return this.organizationRepository.create(createOrganizationDto);
  }

  async findById(id: string): Promise<OrganizationDocument> {
    return this.organizationRepository.findById(id);
  }

  async findAll(): Promise<OrganizationDocument[]> {
    return this.organizationRepository.findAll();
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<OrganizationDocument> {
    return this.organizationRepository.update(id, updateOrganizationDto);
  }

  async delete(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }

  async findByEmail(email: string): Promise<OrganizationDocument> {
    return this.organizationRepository.findByEmail(email);
  }
}
