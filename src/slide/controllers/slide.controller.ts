import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SlideService } from '../services/slide.service';
import { CreateSlideDto } from '../dtos/create-slide.dto';
import { UpdateSlideDto } from '../dtos/update-slide.dto';
import { SlideDocument } from '../entities/slide.entity';

@Controller('slides')
export class SlideController {
  constructor(private readonly slideService: SlideService) {}

  @Post()
  create(@Body() createSlideDto: CreateSlideDto): Promise<SlideDocument> {
    return this.slideService.create(createSlideDto);
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
    return Promise.reject(
      new Error('Either courseId or lessonId must be provided'),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSlideDto: UpdateSlideDto,
  ): Promise<SlideDocument> {
    return this.slideService.update(id, updateSlideDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.slideService.delete(id);
  }
}
