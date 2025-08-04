import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Certificate,
  CertificateDocument,
} from '../entities/certificate.entity';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class CertificateRepository {
  constructor(
    @InjectModel('Certificate')
    private readonly certificateModel: Model<CertificateDocument>,
  ) {}

  async create(data: Partial<Certificate>): Promise<CertificateDocument> {
    const createdCertificate = new this.certificateModel(data);
    return createdCertificate.save();
  }

  async findAll(): Promise<CertificateDocument[]> {
    return this.certificateModel.find().exec();
  }

  async findById(id: string): Promise<CertificateDocument> {
    const certificate = await this.certificateModel.findById(id).exec();
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate;
  }

  async findByCertificateId(
    certificateId: string,
  ): Promise<CertificateDocument> {
    const certificate = await this.certificateModel
      .findOne({ certificateId })
      .exec();
    if (!certificate) {
      throw new NotFoundException(
        `Certificate with ID ${certificateId} not found`,
      );
    }
    return certificate;
  }

  async findByStudent(studentId: string): Promise<CertificateDocument[]> {
    return this.certificateModel
      .find({ studentId: createObjectId(studentId, 'studentId') })
      .populate('courseId', 'courseTitle')
      .populate('organizationId', 'name')
      .populate('issuedBy.userId', 'firstName lastName')
      .exec();
  }

  async findByCourse(courseId: string): Promise<CertificateDocument[]> {
    return this.certificateModel
      .find({ courseId: createObjectId(courseId, 'courseId') })
      .populate('studentId', 'firstName lastName')
      .populate('organizationId', 'name')
      .populate('issuedBy.userId', 'firstName lastName')
      .exec();
  }

  async findByOrganization(
    organizationId: string,
  ): Promise<CertificateDocument[]> {
    return this.certificateModel
      .find({
        organizationId: createObjectId(organizationId, 'organizationId'),
      })
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle')
      .populate('issuedBy.userId', 'firstName lastName')
      .exec();
  }

  async findByIssuer(
    issuerId: string,
    issuerType: string,
  ): Promise<CertificateDocument[]> {
    return this.certificateModel
      .find({
        'issuedBy.userId': createObjectId(issuerId, 'issuerId'),
        'issuedBy.userType': issuerType,
      })
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle')
      .populate('organizationId', 'name')
      .exec();
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<CertificateDocument | null> {
    return this.certificateModel
      .findOne({
        studentId: createObjectId(studentId, 'studentId'),
        courseId: createObjectId(courseId, 'courseId'),
      })
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<Certificate>,
  ): Promise<CertificateDocument> {
    const certificate = await this.certificateModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate;
  }

  async findByIdAndDelete(id: string): Promise<CertificateDocument> {
    const certificate = await this.certificateModel
      .findByIdAndDelete(id)
      .exec();
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate;
  }

  async updateActiveStatus(
    id: string,
    isActive: boolean,
  ): Promise<CertificateDocument> {
    const certificate = await this.certificateModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate;
  }

  async findActiveCertificates(): Promise<CertificateDocument[]> {
    return this.certificateModel
      .find({ isActive: true })
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle')
      .populate('organizationId', 'name')
      .exec();
  }

  async findExpiredCertificates(): Promise<CertificateDocument[]> {
    const now = new Date();
    return this.certificateModel
      .find({
        expiresAt: { $lt: now },
        isActive: true,
      })
      .exec();
  }

  async getCertificateStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byType: { [key: string]: number };
  }> {
    const stats = await this.certificateModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] },
          },
          expired: {
            $sum: {
              $cond: [
                { $and: ['$isActive', { $lt: ['$expiresAt', new Date()] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const typeStats = await this.certificateModel.aggregate([
      {
        $group: {
          _id: '$metadata.certificateType',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: stats[0]?.total || 0,
      active: stats[0]?.active || 0,
      expired: stats[0]?.expired || 0,
      byType: {},
    };

    typeStats.forEach((stat) => {
      result.byType[stat._id || 'unknown'] = stat.count;
    });

    return result;
  }
}
