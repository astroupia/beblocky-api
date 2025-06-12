import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrganizationDocument } from '../entities/organization.entity';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectModel('Organization')
    private organizationModel: Model<OrganizationDocument>,
  ) {}

  async create(
    data: Partial<OrganizationDocument>,
  ): Promise<OrganizationDocument> {
    const created = new this.organizationModel(data);
    return created.save();
  }

  async findById(id: string): Promise<OrganizationDocument> {
    const organization = await this.organizationModel.findById(id).exec();

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findAll(): Promise<OrganizationDocument[]> {
    return this.organizationModel.find().exec();
  }

  async update(
    id: string,
    data: Partial<OrganizationDocument>,
  ): Promise<OrganizationDocument> {
    const organization = await this.organizationModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async delete(id: string): Promise<void> {
    await this.organizationModel.findByIdAndDelete(id).exec();
  }

  async findByEmail(email: string): Promise<OrganizationDocument> {
    const organization = await this.organizationModel
      .findOne({ 'contactInfo.email': email })
      .exec();

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${email} not found`);
    }

    return organization;
  }
}
