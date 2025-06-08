import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { AdminDocument } from '../entities/admin.entity';
import { CreateAdminDto } from '../dtos/create-admin.dto';
import { UpdateAdminDto } from '../dtos/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminDocument> {
    return this.adminRepository.create(createAdminDto);
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
}
