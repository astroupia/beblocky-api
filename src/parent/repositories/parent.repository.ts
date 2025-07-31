import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParentDocument } from '../entities/parent.entity';

@Injectable()
export class ParentRepository {
  constructor(
    @InjectModel('Parent')
    private parentModel: Model<ParentDocument>,
  ) {}

  async create(data: Partial<ParentDocument>): Promise<ParentDocument> {
    const created = new this.parentModel(data);
    return created.save();
  }

  async findById(id: string): Promise<ParentDocument> {
    const parent = await this.parentModel.findById(id).exec();

    if (!parent) {
      throw new NotFoundException(`Parent wiht ID ${id} not found`);
    }

    return parent;
  }

  async findAll(): Promise<ParentDocument[]> {
    return this.parentModel.find().exec();
  }

  async update(
    id: string,
    data: Partial<ParentDocument>,
  ): Promise<ParentDocument> {
    const parent = await this.parentModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async delete(id: string): Promise<void> {
    await this.parentModel.findByIdAndDelete(id).exec();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<ParentDocument> {
    const parent = await this.parentModel.findOne({ phoneNumber }).exec();

    if (!parent) {
      throw new NotFoundException(
        `Parent with Phone Number: ${phoneNumber} is not found`,
      );
    }

    return parent;
  }

  async findByUserId(userId: string): Promise<ParentDocument> {
    const parent = await this.parentModel.findOne({ userId }).exec();
    if (!parent) {
      throw new NotFoundException(`Parent with userId ${userId} not found`);
    }
    return parent;
  }
}
