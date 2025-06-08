import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../repositories/parent.repository';
import { ParentDocument } from '../entities/parent.entity';
import { CreateParentDto } from '../dtos/create-parent.dto';
import { UpdateParentDto } from '../dtos/update-parent.dto';

@Injectable()
export class ParentService {
  constructor(private readonly parentRepository: ParentRepository) {}

  async create(createParentDto: CreateParentDto): Promise<ParentDocument> {
    return this.parentRepository.create(createParentDto);
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
}
