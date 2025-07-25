import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from '../entities/student.entity';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectModel('Student')
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? createObjectId(id, 'id') : id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(data: Partial<Student>): Promise<StudentDocument> {
    const studentData = { ...data };

    // Convert ID fields if they exist
    if (data.schoolId) {
      studentData.schoolId = this.convertToObjectId(data.schoolId);
    }
    if (data.parentId) {
      studentData.parentId = this.convertToObjectId(data.parentId);
    }
    if (data.enrolledCourses) {
      studentData.enrolledCourses = this.convertArrayToObjectIds(
        data.enrolledCourses,
      );
    }

    const createdStudent = new this.studentModel(studentData);
    return createdStudent.save();
  }

  async findAll(): Promise<StudentDocument[]> {
    return this.studentModel.find().exec();
  }

  async findById(id: string): Promise<StudentDocument> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<Student>,
  ): Promise<StudentDocument> {
    const updateData = { ...data };

    // Convert ID fields if they exist in the update data
    if (data.schoolId) {
      updateData.schoolId = this.convertToObjectId(data.schoolId);
    }
    if (data.parentId) {
      updateData.parentId = this.convertToObjectId(data.parentId);
    }
    if (data.enrolledCourses) {
      updateData.enrolledCourses = this.convertArrayToObjectIds(
        data.enrolledCourses,
      );
    }

    const student = await this.studentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findByIdAndDelete(id: string): Promise<StudentDocument> {
    const student = await this.studentModel.findByIdAndDelete(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async addToEnrolledCourses(
    studentId: string,
    courseId: string,
  ): Promise<StudentDocument> {
    const student = await this.studentModel
      .findByIdAndUpdate(
        studentId,
        {
          $addToSet: { enrolledCourses: createObjectId(courseId, 'courseId') },
        },
        { new: true },
      )
      .exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student;
  }

  async removeFromEnrolledCourses(
    studentId: string,
    courseId: string,
  ): Promise<StudentDocument> {
    const student = await this.studentModel
      .findByIdAndUpdate(
        studentId,
        { $pull: { enrolledCourses: createObjectId(courseId, 'courseId') } },
        { new: true },
      )
      .exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student;
  }

  async addCoins(studentId: string, amount: number): Promise<StudentDocument> {
    const student = await this.studentModel
      .findByIdAndUpdate(studentId, { $inc: { coins: amount } }, { new: true })
      .exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student;
  }

  async addGoal(studentId: string, goal: string): Promise<StudentDocument> {
    const student = await this.studentModel
      .findByIdAndUpdate(
        studentId,
        { $addToSet: { goals: goal } },
        { new: true },
      )
      .exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student;
  }
}
