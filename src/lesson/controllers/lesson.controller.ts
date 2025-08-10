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
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import { Lesson } from '../entities/lesson.entity';
import { UpdateLessonDto } from '../dtos/update-lesson.dto';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonService.create(createLessonDto);
  }

  @Get('course/:courseId')
  findByCourseId(@Param('courseId') courseId: string): Promise<Lesson[]> {
    return this.lessonService.findByCourseId(courseId);
  }

  @Get('slide/:slideId')
  findBySlideId(@Param('slideId') slideId: string): Promise<Lesson[]> {
    return this.lessonService.findBySlideId(slideId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonService.findById(id);
  }

  @Get()
  findByCourse(@Query('courseId') courseId?: string): Promise<Lesson[]> {
    if (courseId) {
      return this.lessonService.findByCourseId(courseId);
    }
    return this.lessonService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.lessonService.delete(id);
  }
}
