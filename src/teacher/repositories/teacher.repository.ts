import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Teacher, TeacherDocument } from '../entities/teacher.entity';

@Injectable()
export class TeacherRepository {
  constructor(
    @InjectModel('Teacher')
    private readonly teacherModel: Model<TeacherDocument>,
  ) {}

  async create(data: Partial<Teacher>): Promise<TeacherDocument> {
    const createdTeacher = new this.teacherModel(data);
    return createdTeacher.save();
  }

  async findAll(): Promise<TeacherDocument[]> {
    return this.teacherModel.find().exec();
  }

  async findById(id: string): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findById(id).exec();
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async findByIdAndUpdate(
    id: string,
    updateData: Partial<Teacher>,
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async findByIdAndDelete(id: string): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findByIdAndDelete(id).exec();
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<TeacherDocument[]> {
    return this.teacherModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .exec();
  }

  async addCourse(
    teacherId: string,
    courseId: string,
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherModel
      .findByIdAndUpdate(
        teacherId,
        { $addToSet: { courses: new Types.ObjectId(courseId) } },
        { new: true },
      )
      .exec();
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return teacher;
  }

  async removeCourse(
    teacherId: string,
    courseId: string,
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherModel
      .findByIdAndUpdate(
        teacherId,
        { $pull: { courses: new Types.ObjectId(courseId) } },
        { new: true },
      )
      .exec();
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return teacher;
  }

  async addRating(teacherId: string, rating: number): Promise<TeacherDocument> {
    const teacher = await this.teacherModel
      .findByIdAndUpdate(teacherId, { $push: { rating } }, { new: true })
      .exec();
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return teacher;
  }

  async updateAvailability(
    teacherId: string,
    day: string,
    timeSlots: { startTime: string; endTime: string }[],
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherModel
      .findByIdAndUpdate(
        teacherId,
        { $set: { [`availability.${day}`]: timeSlots } },
        { new: true },
      )
      .exec();
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return teacher;
  }
}
