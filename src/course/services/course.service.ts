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
      courseTitle: createCourseWithContentDto.courseTitle,
      courseDescription: createCourseWithContentDto.courseDescription,
      courseLanguage: createCourseWithContentDto.courseLanguage,
    });

    const lessonIds: Types.ObjectId[] = [];
    const slideIds: Types.ObjectId[] = [];

    // Create lessons and their slides if provided
    if (createCourseWithContentDto.lessons?.length) {
      for (const lessonDto of createCourseWithContentDto.lessons) {
        const lesson = await this.lessonService.create({
          courseId: course._id as Types.ObjectId,
          title: lessonDto.title,
          description: lessonDto.description,
          duration: lessonDto.duration,
        });
        lessonIds.push(lesson._id as Types.ObjectId);

        // Collect slide IDs for this lesson
        const lessonSlideIds: Types.ObjectId[] = [];

        // Create slides for this lesson if provided
        if (createCourseWithContentDto.slides?.length) {
          for (const slideDto of createCourseWithContentDto.slides) {
            const slide = await this.slideService.create({
              courseId: course._id as Types.ObjectId,
              lessonId: lesson._id as Types.ObjectId,
              title: slideDto.title,
              content: slideDto.content,
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
            slideIds.push(slide._id as Types.ObjectId);
            lessonSlideIds.push(slide._id as Types.ObjectId);
          }
        }

        // Update the lesson document with its slides
        await this.lessonService.update(String(lesson._id), {
          slides: lessonSlideIds,
        });
      }
    }

    // Update the course document with the collected lesson and slide IDs
    await this.courseRepository.update(String(course._id), {
      lessons: lessonIds,
      slides: slideIds,
    });

    return this.courseRepository.findById(String(course._id));
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
