import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SlideDocument } from '../entities/slide.entity';

@Injectable()
export class SlideRepository {
  constructor(
    @InjectModel('Slide')
    private readonly slideModel: Model<SlideDocument>,
  ) {}

  async create(data: Partial<SlideDocument>): Promise<SlideDocument> {
    const slide = new this.slideModel(data);
    return await slide.save();
  }

  async findById(id: string): Promise<SlideDocument> {
    const slide = await this.slideModel
      .findById(id)
      .populate('courseId')
      .populate('lessonId')
      .exec();

    if (!slide) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }

    return slide;
  }

  async update(
    id: string,
    updateData: Partial<SlideDocument>,
  ): Promise<SlideDocument> {
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
      .find({ courseId: courseId })
      .sort({ order: 1 })
      .exec();
  }

  async findByLessonId(lessonId: string): Promise<SlideDocument[]> {
    return this.slideModel
      .find({ lessonId: lessonId })
      .sort({ order: 1 })
      .exec();
  }

  async findAll(): Promise<SlideDocument[]> {
    return this.slideModel.find().sort({ order: 1 }).exec();
  }
}
