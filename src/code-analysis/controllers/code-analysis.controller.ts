import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { CodeAnalysisService } from '../services/code-analysis.service';
import { CreateCodeAnalysisDto } from '../dtos/create-code-analysis.dto';

@Controller('code-analysis')
export class CodeAnalysisController {
  constructor(private readonly codeAnalysisService: CodeAnalysisService) {}

  @Post()
  analyzeCode(@Body() createDto: CreateCodeAnalysisDto) {
    return this.codeAnalysisService.analyzeCode(createDto);
  }

  @Get()
  findAll() {
    return this.codeAnalysisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codeAnalysisService.findById(id);
  }

  @Get('progress/:progressId')
  findByProgress(@Param('progressId') progressId: string) {
    return this.codeAnalysisService.findByProgressId(progressId);
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.codeAnalysisService.findByLessonId(lessonId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.codeAnalysisService.findByStudentId(studentId);
  }

  @Get('student/:studentId/stats')
  getStudentStats(@Param('studentId') studentId: string) {
    return this.codeAnalysisService.getStudentStats(studentId);
  }

  @Get(':progressId/:lessonId')
  findByProgressAndLesson(
    @Param('progressId') progressId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.codeAnalysisService.findByProgressAndLesson(
      progressId,
      lessonId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.codeAnalysisService.delete(id);
  }

  // Additional endpoint for finding by ID (if needed)
  @Get('find/:id')
  findById(@Param('id') id: string) {
    return this.codeAnalysisService.findById(id);
  }
}
