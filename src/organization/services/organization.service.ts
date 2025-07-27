import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { OrganizationDocument } from '../entities/organization.entity';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { CreateOrganizationFromUserDto } from '../dtos/create-organization-from-user.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { createUserId } from '../../utils/user-id.utils';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private mapDtoToEntity(
    dto: CreateOrganizationDto | UpdateOrganizationDto,
  ): Partial<OrganizationDocument> {
    const { settings, ...restDto } = dto;
    const mappedDto: Partial<OrganizationDocument> = {
      ...restDto,
      features: dto.features
        ? {
            hasStudentTracking: dto.features.hasStudentTracking ?? false,
            hasProgressTracking: dto.features.hasProgressTracking ?? false,
            hasLeaderboard: dto.features.hasLeaderboard ?? false,
          }
        : undefined,
    };

    // Only add settings if they exist and have required fields
    if (settings?.academicYear?.startDate && settings?.academicYear?.endDate) {
      mappedDto.settings = {
        timezone: settings.timezone ?? 'UTC',
        language: settings.language ?? 'en',
        academicYear: {
          startDate: settings.academicYear.startDate,
          endDate: settings.academicYear.endDate,
        },
      };
    }

    return mappedDto;
  }

  private mapFromUserDtoToEntity(
    dto: CreateOrganizationFromUserDto,
  ): Partial<OrganizationDocument> {
    const { userId, settings, ...restDto } = dto;
    const mappedDto: Partial<OrganizationDocument> = {
      userId: createUserId(userId, 'userId'),
      ...restDto,
      features: dto.features
        ? {
            hasStudentTracking: dto.features.hasStudentTracking ?? false,
            hasProgressTracking: dto.features.hasProgressTracking ?? false,
            hasLeaderboard: dto.features.hasLeaderboard ?? false,
          }
        : undefined,
    };

    // Only add settings if they exist and have required fields
    if (settings?.academicYear?.startDate && settings?.academicYear?.endDate) {
      mappedDto.settings = {
        timezone: settings.timezone ?? 'UTC',
        language: settings.language ?? 'en',
        academicYear: {
          startDate: settings.academicYear.startDate,
          endDate: settings.academicYear.endDate,
        },
      };
    }

    return mappedDto;
  }

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationDocument> {
    const entity = this.mapDtoToEntity(createOrganizationDto);
    return this.organizationRepository.create(entity);
  }

  async createFromUser(
    createOrganizationFromUserDto: CreateOrganizationFromUserDto,
  ): Promise<OrganizationDocument> {
    // Get user information to include email
    const user = await this.userService.findOne(
      createOrganizationFromUserDto.userId,
    );

    const entity = this.mapFromUserDtoToEntity(createOrganizationFromUserDto);
    const createdOrganization =
      await this.organizationRepository.create(entity);

    // Return organization with user email included
    return {
      ...createdOrganization.toObject(),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    } as OrganizationDocument;
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
    const entity = this.mapDtoToEntity(updateOrganizationDto);
    return this.organizationRepository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }

  async findByEmail(email: string): Promise<OrganizationDocument> {
    return this.organizationRepository.findByEmail(email);
  }

  async findByUserId(userId: string): Promise<OrganizationDocument> {
    return this.organizationRepository.findByUserId(userId);
  }
}
