import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { SlideRepository } from '../repositories/slide.repository';
import { CreateSlideDto } from '../dtos/create-slide.dto';
import { Slide, SlideDocument } from '../entities/slide.entity';
import { CourseService } from '../../course/services/course.service';
import { LessonService } from '../../lesson/services/lesson.service';

@Injectable()
export class SlideService {
  constructor(
    private readonly slideRepository: SlideRepository,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,
  ) {}

  private mapDtoToEntity(dto: Partial<CreateSlideDto>): Partial<SlideDocument> {
    const { courseId, lessonId, themeColors, ...restDto } = dto;
    const mappedDto: Partial<SlideDocument> = {
      ...restDto,
      courseId: courseId,
      lessonId: lessonId,
      titleFont: dto.titleFont ?? 'Arial',
      backgroundColor: dto.backgroundColor ?? '#FFFFFF',
      textColor: dto.textColor ?? '#000000',
      imageUrls: dto.imageUrls ?? [],
      themeColors: themeColors ?? {
        main: '#000000',
        secondary: '#FFFFFF',
      },
    };

    return mappedDto;
  }

  async create(createSlideDto: CreateSlideDto): Promise<SlideDocument> {
    // Verify course exists
    await this.courseService.findById(createSlideDto.courseId.toString());

    // If lessonId is provided, verify lesson exists
    if (createSlideDto.lessonId) {
      await this.lessonService.findById(createSlideDto.lessonId.toString());
    }

    const entity = this.mapDtoToEntity(createSlideDto);
    return this.slideRepository.create(entity);
  }

  async findById(id: string): Promise<SlideDocument> {
    return this.slideRepository.findById(id);
  }

  async update(id: string, updateData: Partial<Slide>): Promise<SlideDocument> {
    const entity = this.mapDtoToEntity(updateData as Partial<CreateSlideDto>);
    return this.slideRepository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    await this.slideRepository.delete(id);
  }

  async findByCourseId(courseId: string): Promise<SlideDocument[]> {
    return this.slideRepository.findByCourseId(courseId);
  }

  async findByLessonId(lessonId: string): Promise<SlideDocument[]> {
    return this.slideRepository.findByLessonId(lessonId);
  }
}
