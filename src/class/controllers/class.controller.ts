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
import { ClassService } from '../services/class.service';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto, ExtendClassDto } from '../dtos/update-class.dto';
import { AddStudentDto, RemoveStudentDto } from '../dtos/add-student.dto';
import { AddCourseDto, RemoveCourseDto } from '../dtos/add-course.dto';
import { ClassUserType } from '../entities/class.entity';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  create(
    @Body() createClassDto: CreateClassDto,
    @Query('userId') userId: string,
    @Query('userType') userType: ClassUserType,
  ) {
    return this.classService.create(createClassDto, userId, userType);
  }

  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classService.findById(id);
  }

  @Get('creator/:userId')
  findByCreator(
    @Param('userId') userId: string,
    @Query('userType') userType: string,
  ) {
    return this.classService.findByCreator(userId, userType);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.classService.findByCourse(courseId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.classService.findByStudent(studentId);
  }

  @Get('organization/:organizationId')
  findByOrganization(@Param('organizationId') organizationId: string) {
    return this.classService.findByOrganization(organizationId);
  }

  @Get(':id/stats')
  getClassStats(@Param('id') id: string) {
    return this.classService.getClassStats(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(id, updateClassDto);
  }

  @Patch(':id/add-student')
  addStudent(@Param('id') id: string, @Body() addStudentDto: AddStudentDto) {
    return this.classService.addStudent(id, addStudentDto);
  }

  @Patch(':id/remove-student')
  removeStudent(
    @Param('id') id: string,
    @Body() removeStudentDto: RemoveStudentDto,
  ) {
    return this.classService.removeStudent(id, removeStudentDto);
  }

  @Patch(':id/add-course')
  addCourse(@Param('id') id: string, @Body() addCourseDto: AddCourseDto) {
    return this.classService.addCourse(id, addCourseDto);
  }

  @Patch(':id/remove-course')
  removeCourse(
    @Param('id') id: string,
    @Body() removeCourseDto: RemoveCourseDto,
  ) {
    return this.classService.removeCourse(id, removeCourseDto);
  }

  @Patch(':id/extend')
  extendEndDate(
    @Param('id') id: string,
    @Body() extendClassDto: ExtendClassDto,
  ) {
    return this.classService.extendEndDate(id, extendClassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classService.delete(id);
  }
}
