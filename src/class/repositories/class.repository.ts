import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from '../entities/class.entity';

@Injectable()
export class ClassRepository {
  constructor(
    @InjectModel('Class')
    private readonly classModel: Model<ClassDocument>,
  ) {}

  async create(data: Partial<Class>): Promise<ClassDocument> {
    const createdClass = new this.classModel(data);
    return createdClass.save();
  }

  async findAll(): Promise<ClassDocument[]> {
    return this.classModel.find().exec();
  }

  async findById(id: string): Promise<ClassDocument> {
    const classData = await this.classModel.findById(id).exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classData;
  }

  async findByCreator(
    userId: string,
    userType: string,
  ): Promise<ClassDocument[]> {
    return this.classModel
      .find({
        'createdBy.userId': new Types.ObjectId(userId),
        'createdBy.userType': userType,
      })
      .populate('courses', 'courseTitle')
      .populate('students', 'firstName lastName')
      .populate('organizationId', 'name')
      .exec();
  }

  async findByCourse(courseId: string): Promise<ClassDocument[]> {
    return this.classModel
      .find({ courses: new Types.ObjectId(courseId) })
      .populate('students', 'firstName lastName')
      .populate('createdBy.userId', 'firstName lastName')
      .exec();
  }

  async findByStudent(studentId: string): Promise<ClassDocument[]> {
    return this.classModel
      .find({ students: new Types.ObjectId(studentId) })
      .populate('courses', 'courseTitle')
      .populate('createdBy.userId', 'firstName lastName')
      .populate('organizationId', 'name')
      .exec();
  }

  async findByOrganization(organizationId: string): Promise<ClassDocument[]> {
    return this.classModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .populate('courses', 'courseTitle')
      .populate('students', 'firstName lastName')
      .populate('createdBy.userId', 'firstName lastName')
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<Class>,
  ): Promise<ClassDocument> {
    const classData = await this.classModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classData;
  }

  async findByIdAndDelete(id: string): Promise<ClassDocument> {
    const classData = await this.classModel.findByIdAndDelete(id).exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classData;
  }

  async addStudent(classId: string, studentId: string): Promise<ClassDocument> {
    const classData = await this.classModel
      .findByIdAndUpdate(
        classId,
        { $addToSet: { students: new Types.ObjectId(studentId) } },
        { new: true },
      )
      .exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    return classData;
  }

  async removeStudent(
    classId: string,
    studentId: string,
  ): Promise<ClassDocument> {
    const classData = await this.classModel
      .findByIdAndUpdate(
        classId,
        { $pull: { students: new Types.ObjectId(studentId) } },
        { new: true },
      )
      .exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    return classData;
  }

  async addCourse(classId: string, courseId: string): Promise<ClassDocument> {
    const classData = await this.classModel
      .findByIdAndUpdate(
        classId,
        { $addToSet: { courses: new Types.ObjectId(courseId) } },
        { new: true },
      )
      .exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    return classData;
  }

  async removeCourse(
    classId: string,
    courseId: string,
  ): Promise<ClassDocument> {
    const classData = await this.classModel
      .findByIdAndUpdate(
        classId,
        { $pull: { courses: new Types.ObjectId(courseId) } },
        { new: true },
      )
      .exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    return classData;
  }

  async updateActiveStatus(
    classId: string,
    isActive: boolean,
  ): Promise<ClassDocument> {
    const classData = await this.classModel
      .findByIdAndUpdate(classId, { isActive }, { new: true })
      .exec();
    if (!classData) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }
    return classData;
  }

  async findExpiredClasses(): Promise<ClassDocument[]> {
    const now = new Date();
    return this.classModel
      .find({
        endDate: { $lt: now },
        isActive: true,
      })
      .exec();
  }
}
