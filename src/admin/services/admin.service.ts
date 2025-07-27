import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { AdminDocument } from '../entities/admin.entity';
import { CreateAdminDto } from '../dtos/create-admin.dto';
import { CreateAdminFromUserDto } from '../dtos/create-admin-from-user.dto';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { createUserId } from '../../utils/user-id.utils';
import { createObjectId } from '../../utils/object-id.utils';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

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
    // Get user information to include email
    const user = await this.userService.findOne(createAdminFromUserDto.userId);

    const entity = this.mapFromUserDtoToEntity(createAdminFromUserDto);
    const createdAdmin = await this.adminRepository.create(entity);

    // Return admin with user email included
    return {
      ...createdAdmin.toObject(),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    } as AdminDocument;
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
