import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  OrganizationApplication,
  OrganizationApplicationDocument,
} from '../entities/organization-application.entity';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class OrganizationApplicationRepository {
  constructor(
    @InjectModel('OrganizationApplication')
    private readonly applicationModel: Model<OrganizationApplicationDocument>,
  ) {}

  async create(
    data: Partial<OrganizationApplication>,
  ): Promise<OrganizationApplicationDocument> {
    const createdApplication = new this.applicationModel(data);
    return createdApplication.save();
  }

  async findAll(): Promise<OrganizationApplicationDocument[]> {
    return this.applicationModel.find().exec();
  }

  async findById(id: string): Promise<OrganizationApplicationDocument> {
    const application = await this.applicationModel.findById(id).exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async findByStudent(
    studentId: string,
  ): Promise<OrganizationApplicationDocument[]> {
    return this.applicationModel
      .find({ studentId: createObjectId(studentId, 'studentId') })
      .populate('organizationId', 'name')
      .populate('reviewedBy', 'firstName lastName')
      .exec();
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<OrganizationApplicationDocument[]> {
    return this.applicationModel
      .find({
        organizationId: createObjectId(organizationId, 'organizationId'),
      })
      .populate('studentId', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .exec();
  }

  async findByStudentAndOrganization(
    studentId: string,
    organizationId: string,
  ): Promise<OrganizationApplicationDocument | null> {
    return this.applicationModel
      .findOne({
        studentId: createObjectId(studentId, 'studentId'),
        organizationId: createObjectId(organizationId, 'organizationId'),
      })
      .exec();
  }

  async findByStatus(
    status: string,
  ): Promise<OrganizationApplicationDocument[]> {
    return this.applicationModel
      .find({ status })
      .populate('studentId', 'firstName lastName')
      .populate('organizationId', 'name')
      .populate('reviewedBy', 'firstName lastName')
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<OrganizationApplication>,
  ): Promise<OrganizationApplicationDocument> {
    const application = await this.applicationModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async findByIdAndDelete(
    id: string,
  ): Promise<OrganizationApplicationDocument> {
    const application = await this.applicationModel
      .findByIdAndDelete(id)
      .exec();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async getApplicationStats(organizationId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const stats = await this.applicationModel.aggregate([
      {
        $match: {
          organizationId: createObjectId(organizationId, 'organizationId'),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }
}
