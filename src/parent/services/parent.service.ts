import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../repositories/parent.repository';
import { ParentDocument } from '../entities/parent.entity';
import { CreateParentDto } from '../dtos/create-parent.dto';
import { CreateParentFromUserDto } from '../dtos/create-parent-from-user.dto';
import { UpdateParentDto } from '../dtos/update-parent.dto';
import { createUserId } from '../../utils/user-id.utils';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class ParentService {
  constructor(private readonly parentRepository: ParentRepository) {}

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
    const entity = this.mapFromUserDtoToEntity(createParentFromUserDto);
    return this.parentRepository.create(entity);
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
