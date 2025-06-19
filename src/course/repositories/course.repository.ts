import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../entities/course.entity';
import { CreateCourseDto } from '../dtos/create-course.dto';

@Injectable()
export class CourseRepository {
  constructor(
    @InjectModel('Course')
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    const course = new this.courseModel({
      courseTitle: createCourseDto.courseTitle,
      courseDescription: createCourseDto.courseDescription,
      courseLanguage: createCourseDto.courseLanguage,
      lessons: createCourseDto.lessonIds || [],
      slides: createCourseDto.slideIds || [],
    });
    return await course.save();
  }

  async findById(id: string): Promise<CourseDocument> {
    const course = await this.courseModel
      .findById(id)
      .populate('lessons')
      .populate('slides')
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(
    id: string,
    updateData: Partial<Course>,
  ): Promise<CourseDocument> {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async delete(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndDelete(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.courseModel
      .find()
      .populate('lessons')
      .populate('slides')
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    updateData: Partial<Course>,
  ): Promise<CourseDocument> {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async findByIdAndDelete(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndDelete(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }
}
