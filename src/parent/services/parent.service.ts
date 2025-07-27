import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ParentRepository } from '../repositories/parent.repository';
import { ParentDocument } from '../entities/parent.entity';
import { CreateParentDto } from '../dtos/create-parent.dto';
import { CreateParentFromUserDto } from '../dtos/create-parent-from-user.dto';
import { UpdateParentDto } from '../dtos/update-parent.dto';
import { createUserId } from '../../utils/user-id.utils';
import { createObjectId } from '../../utils/object-id.utils';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class ParentService {
  constructor(
    private readonly parentRepository: ParentRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private mapFromUserDtoToEntity(
    dto: CreateParentFromUserDto,
  ): Partial<ParentDocument> {
    const { userId, children, ...restDto } = dto;
    const entity: Partial<ParentDocument> = {
      userId: createUserId(userId, 'userId'),
      ...restDto,
    };

    if (children) {
      entity.children = children.map((id) => createObjectId(id, 'childId'));
    }

    return entity;
  }

  async create(createParentDto: CreateParentDto): Promise<ParentDocument> {
    return this.parentRepository.create(createParentDto);
  }

  async createFromUser(
    createParentFromUserDto: CreateParentFromUserDto,
  ): Promise<ParentDocument> {
    // Get user information to include email
    const user = await this.userService.findOne(createParentFromUserDto.userId);

    const entity = this.mapFromUserDtoToEntity(createParentFromUserDto);
    const createdParent = await this.parentRepository.create(entity);

    // Return parent with user email included
    return {
      ...createdParent.toObject(),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    } as ParentDocument;
  }

  async findById(id: string): Promise<ParentDocument> {
    return this.parentRepository.findById(id);
  }

  async findAll(): Promise<ParentDocument[]> {
    return this.parentRepository.findAll();
  }

  async update(
    id: string,
    updateParentDto: UpdateParentDto,
  ): Promise<ParentDocument> {
    return this.parentRepository.update(id, updateParentDto);
  }

  async delete(id: string): Promise<void> {
    await this.parentRepository.delete(id);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<ParentDocument> {
    return this.parentRepository.findByPhoneNumber(phoneNumber);
  }

  async findByUserId(userId: string): Promise<ParentDocument> {
    return this.parentRepository.findByUserId(userId);
  }
}
