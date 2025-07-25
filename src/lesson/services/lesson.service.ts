import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { LessonRepository } from '../repositories/lesson.repository';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import { Lesson, LessonDocument } from '../entities/lesson.entity';
import { CourseService } from '../../course/services/course.service';
import { SlideService } from '../../slide/services/slide.service';
import { createObjectId } from '../../utils/object-id.utils';
import { Types } from 'mongoose';

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepository: LessonRepository,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => SlideService))
    private readonly slideService: SlideService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<LessonDocument> {
    // Verify course exists
    await this.courseService.findById(createLessonDto.courseId.toString());
    return this.lessonRepository.create(createLessonDto);
  }

  async findById(id: string): Promise<LessonDocument> {
    return this.lessonRepository.findById(id);
  }

  async update(id: string, updateData: any): Promise<LessonDocument> {
    const isMongoOperator = Object.keys(updateData).some((key) =>
      ['$pull', '$addToSet', '$push'].includes(key),
    );
    if (isMongoOperator) {
      return this.lessonRepository.updateRaw(id, updateData);
    }

    // Convert string IDs to ObjectIds if they exist
    const convertedData: Partial<Lesson> = { ...updateData };

    if (updateData.courseId && typeof updateData.courseId === 'string') {
      convertedData.courseId = createObjectId(updateData.courseId, 'courseId');
    }

    if (updateData.slides && Array.isArray(updateData.slides)) {
      convertedData.slides = updateData.slides.map(
        (slideId: string | Types.ObjectId) =>
          typeof slideId === 'string'
            ? createObjectId(slideId, 'slideId')
            : slideId,
      );
    }

    return this.lessonRepository.update(id, convertedData);
  }

  async delete(id: string): Promise<void> {
    const lesson = await this.findById(id);

    // Cascade delete slides
    for (const slideId of lesson.slides) {
      await this.slideService.delete(slideId.toString());
    }

    await this.lessonRepository.delete(id);
  }

  async findByCourseId(courseId: string): Promise<LessonDocument[]> {
    return this.lessonRepository.findByCourseId(courseId);
  }

  async findAll(): Promise<LessonDocument[]> {
    return this.lessonRepository.findAll();
  }
}
