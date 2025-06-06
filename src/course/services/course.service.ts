import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { CreateCourseWithContentDto } from '../dtos/create-course-with-content.dto';
import { Course, CourseDocument } from '../entities/course.entity';
import { LessonService } from '../../lesson/services/lesson.service';
import { SlideService } from '../../slide/services/slide.service';
import { Types } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,
    @Inject(forwardRef(() => SlideService))
    private readonly slideService: SlideService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    return this.courseRepository.create(createCourseDto);
  }

  async createWithContent(
    createCourseWithContentDto: CreateCourseWithContentDto,
  ): Promise<CourseDocument> {
    // First create the course
    const course = await this.courseRepository.create({
      title: createCourseWithContentDto.title,
      description: createCourseWithContentDto.description || '',
    });

    const lessonIds: Types.ObjectId[] = [];
    const slideIds: Types.ObjectId[] = [];

    // Create lessons if provided
    if (createCourseWithContentDto.lessons?.length) {
      for (const lessonDto of createCourseWithContentDto.lessons) {
        const lesson = await this.lessonService.create({
          ...lessonDto,
          courseId: course._id as Types.ObjectId,
        });
        if (lesson._id) {
          lessonIds.push(lesson._id as Types.ObjectId);
        }
      }
    }

    // Create slides if provided
    if (createCourseWithContentDto.slides?.length) {
      for (const slideDto of createCourseWithContentDto.slides) {
        const slide = await this.slideService.create({
          ...slideDto,
          courseId: course._id as Types.ObjectId,
        });
        if (slide._id) {
          slideIds.push(slide._id as Types.ObjectId);
        }
      }
    }

    // Update course with created lesson and slide IDs
    const courseId = (course._id as Types.ObjectId).toString();
    return this.update(courseId, {
      lessons: lessonIds,
      slides: slideIds,
    });
  }

  async findById(id: string): Promise<CourseDocument> {
    return this.courseRepository.findById(id);
  }

  async update(
    id: string,
    updateData: Partial<Course>,
  ): Promise<CourseDocument> {
    return this.courseRepository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const course = await this.findById(id);

    // Cascade delete lessons
    for (const lessonId of course.lessons) {
      await this.lessonService.delete(lessonId.toString());
    }

    // Cascade delete slides
    for (const slideId of course.slides) {
      await this.slideService.delete(slideId.toString());
    }

    await this.courseRepository.delete(id);
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.courseRepository.findAll();
  }
}
