import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProgressService } from '../services/progress.service';
import { CreateProgressDto } from '../dtos/create-progress.dto';
import { UpdateProgressDto } from '../dtos/update-progress.dto';
import { CompleteLessonDto } from '../dtos/complete-lesson.dto';
import { SaveCodeDto } from '../dtos/save-code.dto';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  create(@Body() createProgressDto: CreateProgressDto) {
    return this.progressService.create(createProgressDto);
  }

  @Get()
  findAll() {
    return this.progressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.progressService.findById(id);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.progressService.findByStudentId(studentId);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.progressService.findByCourseId(courseId);
  }

  @Get(':studentId/:courseId')
  findByStudentAndCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.findByStudentAndCourse(studentId, courseId);
  }

  @Get(':studentId/:courseId/percentage')
  getCompletionPercentage(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCompletionPercentage(studentId, courseId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.update(id, updateProgressDto);
  }

  @Patch(':id/complete-lesson')
  completeLesson(
    @Param('id') id: string,
    @Body() completeLessonDto: CompleteLessonDto,
  ) {
    return this.progressService.completeLesson(id, completeLessonDto);
  }

  @Patch(':id/save-code')
  saveCode(@Param('id') id: string, @Body() saveCodeDto: SaveCodeDto) {
    return this.progressService.saveCode(id, saveCodeDto);
  }

  @Patch(':id/time-spent')
  updateTimeSpent(@Param('id') id: string, @Body('minutes') minutes: number) {
    return this.progressService.updateTimeSpent(id, minutes);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.progressService.delete(id);
  }
}
