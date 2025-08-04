import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { SlideRepository } from '../repositories/slide.repository';
import { CreateSlideDto } from '../dtos/create-slide.dto';
import { Slide, SlideDocument } from '../entities/slide.entity';
import { CourseService } from '../../course/services/course.service';
import { LessonService } from '../../lesson/services/lesson.service';
import { CloudinaryService } from '../../cloudinary/services/cloudinary.service';

@Injectable()
export class SlideService {
  constructor(
    private readonly slideRepository: SlideRepository,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,
    private readonly cloudinaryService: CloudinaryService,
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

  async findAll(): Promise<SlideDocument[]> {
    return this.slideRepository.findAll();
  }

  async createWithImages(
    createSlideDto: CreateSlideDto,
    uploadImage: any[],
  ): Promise<SlideDocument> {
    // Upload images if provided
    let imageUrls: string[] = [];
    if (uploadImage && uploadImage.length > 0) {
      imageUrls = await Promise.all(
        uploadImage.map((file) => this.cloudinaryService.uploadFile(file)),
      );
    }
    const dtoWithImages = { ...createSlideDto, imageUrls };
    return this.create(dtoWithImages);
  }

  /**
   * Updates a slide with images, preserving existing images and appending new ones.
   *
   * Behavior:
   * - Preserves all existing images unless explicitly removed
   * - Appends newly uploaded images to existing ones
   * - Can remove specific images using removeImageUrls field
   * - If imageUrls is explicitly provided in DTO, it replaces all images (legacy behavior)
   *
   * @param id - Slide ID
   * @param updateSlideDto - Update data including optional removeImageUrls array
   * @param uploadImage - Array of new image files to upload
   * @returns Updated slide document
   */
  async updateWithImages(
    id: string,
    updateSlideDto: Partial<CreateSlideDto> & { removeImageUrls?: string[] },
    uploadImage: any[],
  ): Promise<SlideDocument> {
    // Get the existing slide to preserve current images
    const existingSlide = await this.findById(id);
    let imageUrls: string[] = [...(existingSlide.imageUrls || [])];

    // Remove specified images if any
    if (
      updateSlideDto.removeImageUrls &&
      updateSlideDto.removeImageUrls.length > 0
    ) {
      imageUrls = imageUrls.filter(
        (url) => !updateSlideDto.removeImageUrls!.includes(url),
      );
    }

    // Upload and append new images if provided
    if (uploadImage && uploadImage.length > 0) {
      const newImageUrls = await Promise.all(
        uploadImage.map((file) => this.cloudinaryService.uploadFile(file)),
      );
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // If imageUrls is explicitly provided in the DTO, use it (for complete replacement)
    if (updateSlideDto.imageUrls !== undefined) {
      imageUrls = updateSlideDto.imageUrls;
    }

    const dtoWithImages = { ...updateSlideDto, imageUrls };
    return this.update(id, dtoWithImages);
  }

  /**
   * Removes specific images from a slide by their URLs.
   *
   * @param id - Slide ID
   * @param imageUrlsToRemove - Array of image URLs to remove
   * @returns Updated slide document
   */
  async removeImages(
    id: string,
    imageUrlsToRemove: string[],
  ): Promise<SlideDocument> {
    const existingSlide = await this.findById(id);
    const updatedImageUrls = existingSlide.imageUrls.filter(
      (url) => !imageUrlsToRemove.includes(url),
    );

    return this.update(id, { imageUrls: updatedImageUrls });
  }
}
