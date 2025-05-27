import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { CourseRepository } from '../repositories/course.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { Course, CourseDocument } from '../entities/course.entity';
import { LessonService } from '../../lesson/services/lesson.service';
import { SlideService } from '../../slide/services/slide.service';

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
