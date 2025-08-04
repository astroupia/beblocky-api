import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { Course, CourseDocument } from '../entities/course.entity';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { CreateCourseWithContentDto } from '../dtos/create-course-with-content.dto';
import { LessonService } from '../../lesson/services/lesson.service';
import { SlideService } from '../../slide/services/slide.service';
import { Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly lessonService: LessonService,
    private readonly slideService: SlideService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    return this.courseRepository.create(createCourseDto);
  }

  async createWithContent(
    dto: CreateCourseWithContentDto,
    uploadImage: Express.Multer.File[],
  ): Promise<CourseDocument> {
    const course = await this.courseRepository.create({
      courseTitle: dto.courseTitle,
      courseDescription: dto.courseDescription,
      courseLanguage: dto.courseLanguage,
    });

    const lessonIds: Types.ObjectId[] = [];
    const slideIds: Types.ObjectId[] = [];

    // 1. Upload Images (shared for all slides)
    const imageUrls: string[] = [];
    for (const file of uploadImage || []) {
      const uploaded = await this.cloudinaryService.uploadFile(file);
      imageUrls.push(uploaded);
    }

    // 2. Create Lessons
    for (const lessonDto of dto.lessons || []) {
      const lesson = await this.lessonService.create({
        courseId: (course._id as Types.ObjectId).toString(),
        title: lessonDto.title,
        description: lessonDto.description,
        duration: lessonDto.duration,
      });
      lessonIds.push(lesson._id as Types.ObjectId);

      // 3. Create Slides for this Lesson
      const lessonSlideIds: Types.ObjectId[] = [];
      if (dto.slides?.length) {
        for (const slideDto of dto.slides) {
          const slide = await this.slideService.create({
            courseId: course._id as Types.ObjectId,
            lessonId: lesson._id as Types.ObjectId,
            title: slideDto.title,
            content: slideDto.content,
            order: slideDto.order,
            titleFont: slideDto.titleFont,
            contentFont: slideDto.contentFont,
            backgroundColor: slideDto.backgroundColor,
            textColor: slideDto.textColor,
            imageUrls, // Use array of image URLs from upload
            startingCode: slideDto.startingCode,
            solutionCode: slideDto.solutionCode,
            themeColors: slideDto.themeColors
              ? {
                  main: slideDto.themeColors.main,
                  secondary: slideDto.themeColors.secondary,
                  accent: slideDto.themeColors.accent,
                }
              : undefined,
            videoUrl: slideDto.videoUrl,
          });
          slideIds.push(slide._id as Types.ObjectId);
          lessonSlideIds.push(slide._id as Types.ObjectId);
        }
      }

      // 4. Update the lesson document with its slides
      await this.lessonService.update(String(lesson._id), {
        slides: lessonSlideIds.map((id) => id.toString()),
      });
    }

    // 5. Update course with lesson and slide references
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
      String(id),
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
