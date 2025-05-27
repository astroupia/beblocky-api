import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Slide,
  SlideDocument,
  SlideSchemaClass,
} from '../entities/slide.entity';
import { CreateSlideDto } from '../dto/create-slide.dto';

@Injectable()
export class SlideRepository {
  constructor(
    @InjectModel(SlideSchemaClass.name)
    private readonly slideModel: Model<SlideDocument>,
  ) {}

  async create(createSlideDto: CreateSlideDto): Promise<SlideDocument> {
    const slide = new this.slideModel({
      title: createSlideDto.title,
      content: createSlideDto.content,
      course: createSlideDto.courseId,
      lesson: createSlideDto.lessonId,
      order: createSlideDto.order || 0,
    });
    return await slide.save();
  }

  async findById(id: string): Promise<SlideDocument> {
    const slide = await this.slideModel
      .findById(id)
      .populate('course')
      .populate('lesson')
      .exec();

    if (!slide) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }

    return slide;
  }

  async update(id: string, updateData: Partial<Slide>): Promise<SlideDocument> {
    const slide = await this.slideModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!slide) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }

    return slide;
  }

  async delete(id: string): Promise<SlideDocument> {
    const slide = await this.slideModel.findByIdAndDelete(id).exec();

    if (!slide) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }

    return slide;
  }

  async findByCourseId(courseId: string): Promise<SlideDocument[]> {
    return this.slideModel
      .find({ course: courseId })
      .populate('course')
      .populate('lesson')
      .sort({ order: 1 })
      .exec();
  }

  async findByLessonId(lessonId: string): Promise<SlideDocument[]> {
    return this.slideModel
      .find({ lesson: lessonId })
      .populate('course')
      .populate('lesson')
      .sort({ order: 1 })
      .exec();
  }
}
