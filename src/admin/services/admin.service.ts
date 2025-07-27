import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { AdminDocument } from '../entities/admin.entity';
import { CreateAdminDto } from '../dtos/create-admin.dto';
import { CreateAdminFromUserDto } from '../dtos/create-admin-from-user.dto';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { createUserId } from '../../utils/user-id.utils';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  private mapFromUserDtoToEntity(
    dto: CreateAdminFromUserDto,
  ): Partial<AdminDocument> {
    const { userId, managedOrganizations, ...restDto } = dto;
    const entity: Partial<AdminDocument> = {
      userId: createUserId(userId, 'userId'),
      ...restDto,
    };

    if (managedOrganizations) {
      entity.managedOrganizations = managedOrganizations.map((id) =>
        createObjectId(id, 'organizationId'),
      );
    }

    return entity;
  }

  async create(createAdminDto: CreateAdminDto): Promise<AdminDocument> {
    return this.adminRepository.create(createAdminDto);
  }

  async createFromUser(
    createAdminFromUserDto: CreateAdminFromUserDto,
  ): Promise<AdminDocument> {
    const entity = this.mapFromUserDtoToEntity(createAdminFromUserDto);
    return this.adminRepository.create(entity);
  }

  async findById(id: string): Promise<AdminDocument> {
    return this.adminRepository.findById(id);
  }

  async findAll(): Promise<AdminDocument[]> {
    return this.adminRepository.findAll();
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<AdminDocument> {
    return this.adminRepository.update(id, updateAdminDto);
  }

  async delete(id: string): Promise<void> {
    await this.adminRepository.delete(id);
  }

  async findByAccessLevel(accessLevel: string): Promise<AdminDocument[]> {
    return this.adminRepository.findByAccessLevel(accessLevel);
  }

  async findByUserId(userId: string): Promise<AdminDocument> {
    return this.adminRepository.findByUserId(userId);
  }
}
