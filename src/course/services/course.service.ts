import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { Course, CourseDocument } from '../entities/course.entity';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { CreateCourseWithContentDto } from '../dtos/create-course-with-content.dto';
import { LessonService } from '../../lesson/services/lesson.service';
import { SlideService } from '../../slide/services/slide.service';
import { Types } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly lessonService: LessonService,
    private readonly slideService: SlideService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    return this.courseRepository.create(createCourseDto);
  }

  async createWithContent(
    createCourseWithContentDto: CreateCourseWithContentDto,
  ): Promise<CourseDocument> {
    // Create the course first
    const course = await this.courseRepository.create({
      title: createCourseWithContentDto.title,
      description: createCourseWithContentDto.description || '',
      courseLanguage: createCourseWithContentDto.courseLanguage,
    });

    // Create lessons and their slides if provided
    if (createCourseWithContentDto.lessons?.length) {
      for (const lessonDto of createCourseWithContentDto.lessons) {
        const lesson = await this.lessonService.create({
          courseId: course._id as Types.ObjectId,
          title: lessonDto.title,
          description: lessonDto.description,
          duration: lessonDto.duration,
        });

        // Create slides for this lesson if provided
        if (createCourseWithContentDto.slides?.length) {
          for (const slideDto of createCourseWithContentDto.slides) {
            await this.slideService.create({
              courseId: course._id as Types.ObjectId,
              lessonId: lesson._id as Types.ObjectId,
              title: slideDto.title,
              content: slideDto.content,
              order: slideDto.order,
              titleFont: slideDto.titleFont,
              contentFont: slideDto.contentFont,
              backgroundColor: slideDto.backgroundColor,
              textColor: slideDto.textColor,
              imageUrl: slideDto.imageUrl,
              videoUrl: slideDto.videoUrl,
              themeColors: slideDto.themeColors
                ? {
                    main: slideDto.themeColors.main,
                    secondary: slideDto.themeColors.secondary,
                    accent: slideDto.themeColors.accent,
                  }
                : undefined,
            });
          }
        }
      }
    }
    return this.courseRepository.findById(course._id as string);
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.courseRepository.findAll();
  }

  async findById(id: string): Promise<CourseDocument> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(
    id: string,
    updateCourseDto: Partial<Course>,
  ): Promise<CourseDocument> {
    const course = await this.courseRepository.findByIdAndUpdate(
      id,
      updateCourseDto,
    );
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async delete(id: string): Promise<void> {
    const course = await this.courseRepository.findByIdAndDelete(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
