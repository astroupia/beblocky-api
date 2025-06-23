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

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(data: Partial<Teacher>): Promise<TeacherDocument> {
    const teacherData = { ...data };

    // Convert ID fields if they exist
    if (data.organizationId) {
      teacherData.organizationId = this.convertToObjectId(data.organizationId);
    }
    if (data.courses) {
      teacherData.courses = this.convertArrayToObjectIds(data.courses);
    }
    if (data.subscription) {
      teacherData.subscription = this.convertToObjectId(data.subscription);
    }

    const createdTeacher = new this.teacherModel(teacherData);
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
    const dataToUpdate = { ...updateData };

    // Convert ID fields if they exist in the update data
    if (updateData.organizationId) {
      dataToUpdate.organizationId = this.convertToObjectId(
        updateData.organizationId,
      );
    }
    if (updateData.courses) {
      dataToUpdate.courses = this.convertArrayToObjectIds(updateData.courses);
    }
    if (updateData.subscription) {
      dataToUpdate.subscription = this.convertToObjectId(
        updateData.subscription,
      );
    }

    const teacher = await this.teacherModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
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
      .find({ organizationId: this.convertToObjectId(organizationId) })
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
