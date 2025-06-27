import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from '../entities/lesson.entity';
import { CreateLessonDto } from '../dtos/create-lesson.dto';

@Injectable()
export class LessonRepository {
  constructor(
    @InjectModel('Lesson')
    private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<LessonDocument> {
    const courseId =
      typeof createLessonDto.courseId === 'string'
        ? new Types.ObjectId(createLessonDto.courseId)
        : createLessonDto.courseId;
    const lesson = new this.lessonModel({
      title: createLessonDto.title,
      description: createLessonDto.description,
      duration: createLessonDto.duration,
      courseId,
      slides: createLessonDto.slides || [],
    });
    return await lesson.save();
  }

  async findById(id: string): Promise<LessonDocument> {
    const lesson = await this.lessonModel
      .findById(id)
      .populate('courseId')
      .populate('slides')
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async updateRaw(id: string, rawUpdate: any): Promise<LessonDocument> {
    const lesson = await this.lessonModel
      .findByIdAndUpdate(id, rawUpdate, { new: true })
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async update(
    id: string,
    updateData: Partial<Lesson>,
  ): Promise<LessonDocument> {
    const lesson = await this.lessonModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async delete(id: string): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findByIdAndDelete(id).exec();

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async findByCourseId(courseId: string): Promise<LessonDocument[]> {
    const objectId =
      typeof courseId === 'string' ? new Types.ObjectId(courseId) : courseId;
    return this.lessonModel
      .find({ courseId: objectId })
      .populate('courseId')
      .populate('slides')
      .exec();
  }

  async findAll(): Promise<LessonDocument[]> {
    return this.lessonModel
      .find()
      .populate('courseId')
      .populate('slides')
      .exec();
  }
}
