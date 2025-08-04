import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { SlideService } from '../services/slide.service';
import { CreateSlideDto } from '../dtos/create-slide.dto';
import { UpdateSlideDto } from '../dtos/update-slide.dto';
import { SlideDocument } from '../entities/slide.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('slides')
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('uploadImage'))
  async create(
    @UploadedFiles() uploadImage: Express.Multer.File[],
    @Body('data') raw: string,
  ): Promise<SlideDocument> {
    const dto = JSON.parse(raw) as CreateSlideDto;
    return this.slideService.createWithImages(dto, uploadImage);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SlideDocument> {
    return this.slideService.findById(id);
  }

  @Get()
  findByCourseOrLesson(
    @Query('courseId') courseId?: string,
    @Query('lessonId') lessonId?: string,
  ): Promise<SlideDocument[]> {
    if (courseId) {
      return this.slideService.findByCourseId(courseId);
    }
    if (lessonId) {
      return this.slideService.findByLessonId(lessonId);
    }
    return this.slideService.findAll();
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('uploadImage'))
  async update(
    @Param('id') id: string,
    @UploadedFiles() uploadImage: Express.Multer.File[],
    @Body('data') raw: string,
  ): Promise<SlideDocument> {
    const dto = JSON.parse(raw) as UpdateSlideDto;
    return this.slideService.updateWithImages(id, dto, uploadImage);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.slideService.delete(id);
  }

  @Delete(':id/images')
  removeImages(
    @Param('id') id: string,
    @Body('imageUrls') imageUrls: string[],
  ): Promise<SlideDocument> {
    return this.slideService.removeImages(id, imageUrls);
  }
}
