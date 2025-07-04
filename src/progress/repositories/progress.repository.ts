import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from '../entities/progress.entity';

@Injectable()
export class ProgressRepository {
  constructor(
    @InjectModel('Progress')
    private readonly progressModel: Model<ProgressDocument>,
  ) {}

  async create(data: Partial<Progress>): Promise<ProgressDocument> {
    const createdProgress = new this.progressModel(data);
    return createdProgress.save();
  }

  async findAll(): Promise<ProgressDocument[]> {
    return this.progressModel.find().exec();
  }

  async findById(id: string): Promise<ProgressDocument> {
    const progress = await this.progressModel.findById(id).exec();
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return progress;
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
      })
      .exec();
    if (!progress) {
      throw new NotFoundException(
        `Progress for student ${studentId} and course ${courseId} not found`,
      );
    }
    return progress;
  }

  async findByStudentId(studentId: string): Promise<ProgressDocument[]> {
    return this.progressModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('courseId', 'courseTitle')
      .exec();
  }

  async findByCourseId(courseId: string): Promise<ProgressDocument[]> {
    return this.progressModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .populate('studentId', 'firstName lastName')
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<Progress>,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return progress;
  }

  async findByIdAndDelete(id: string): Promise<ProgressDocument> {
    const progress = await this.progressModel.findByIdAndDelete(id).exec();
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return progress;
  }

  async updateCompletedLessons(
    id: string,
    lessonId: string,
    completionData: any,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            [`completedLessons.${lessonId}`]: completionData,
          },
        },
        { new: true },
      )
      .exec();
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return progress;
  }

  async updateLessonCode(
    id: string,
    lessonId: string,
    codeData: any,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            [`lessonCode.${lessonId}`]: codeData,
          },
        },
        { new: true },
      )
      .exec();
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return progress;
  }

  async updateTimeSpent(
    id: string,
    weekKey: string,
    minutes: number,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel
      .findByIdAndUpdate(
        id,
        {
          $inc: {
            [`timeSpent.${weekKey}`]: minutes,
          },
        },
        { new: true },
      )
      .exec();
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${id} not found`);
    }
    return progress;
  }

  async exists(studentId: string, courseId: string): Promise<boolean> {
    const count = await this.progressModel
      .countDocuments({
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
      })
      .exec();
    return count > 0;
  }
}
