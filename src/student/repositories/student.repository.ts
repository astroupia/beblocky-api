import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from '../entities/student.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectModel('Student')
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  async create(data: Partial<Student>): Promise<StudentDocument> {
    const createdStudent = new this.studentModel(data);
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
    const student = await this.studentModel
      .findByIdAndUpdate(id, data, { new: true })
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
        { $addToSet: { enrolledCourses: new Types.ObjectId(courseId) } },
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
        { $pull: { enrolledCourses: new Types.ObjectId(courseId) } },
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
