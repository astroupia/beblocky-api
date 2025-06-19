import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from '../entities/lesson.entity';
import { CreateLessonDto } from '../dtos/create-lesson.dto';

@Injectable()
export class LessonRepository {
  constructor(
    @InjectModel('Lesson')
    private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<LessonDocument> {
    const lesson = new this.lessonModel({
      title: createLessonDto.title,
      description: createLessonDto.description,
      duration: createLessonDto.duration,
      course: createLessonDto.courseId,
      slides: createLessonDto.slides || [],
    });
    return await lesson.save();
  }

  async findById(id: string): Promise<LessonDocument> {
    const lesson = await this.lessonModel
      .findById(id)
      .populate('course')
      .populate('slides')
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
    return this.lessonModel
      .find({ course: courseId })
      .populate('course')
      .populate('slides')
      .exec();
  }
}
