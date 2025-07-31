import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminDocument } from '../entities/admin.entity';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel('Admin')
    private adminModel: Model<AdminDocument>,
  ) {}

  async create(data: Partial<AdminDocument>): Promise<AdminDocument> {
    const created = new this.adminModel(data);
    return created.save();
  }

  async findById(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findById(id).exec();

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async findAll(): Promise<AdminDocument[]> {
    return this.adminModel.find().exec();
  }

  async update(
    id: string,
    data: Partial<AdminDocument>,
  ): Promise<AdminDocument> {
    const admin = await this.adminModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async delete(id: string): Promise<void> {
    await this.adminModel.findByIdAndDelete(id).exec();
  }

  async findByAccessLevel(accessLevel: string): Promise<AdminDocument[]> {
    return this.adminModel.find({ accessLevel }).exec();
  }

  async findByUserId(userId: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findOne({ userId }).exec();
    if (!admin) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }
    return admin;
  }
}
