import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { CreateCourseWithContentDto } from '../dtos/create-course-with-content.dto';
import { Course } from '../entities/course.entity';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    const course = await this.courseService.create(createCourseDto);
    return course.toObject() as Course;
  }

  @Post('with-content')
  async createWithContent(
    @Body() createCourseWithContentDto: CreateCourseWithContentDto,
  ): Promise<Course> {
    const course = await this.courseService.createWithContent(
      createCourseWithContentDto,
    );
    return course.toObject() as Course;
  }

  @Get()
  async findAll(): Promise<Course[]> {
    const courses = await this.courseService.findAll();
    return courses.map((course) => course.toObject() as Course);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course> {
    const course = await this.courseService.findById(id);
    return course.toObject() as Course;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: Partial<Course>,
  ): Promise<Course> {
    const course = await this.courseService.update(id, updateCourseDto);
    return course.toObject() as Course;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.courseService.delete(id);
  }
}
