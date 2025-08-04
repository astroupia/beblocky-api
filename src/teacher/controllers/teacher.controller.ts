import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TeacherService } from '../services/teacher.service';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { CreateTeacherFromUserDto } from '../dtos/create-teacher-from-user.dto';
import { UpdateTeacherDto } from '../dtos/update-teacher.dto';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Post('from-user')
  createFromUser(@Body() createTeacherFromUserDto: CreateTeacherFromUserDto) {
    return this.teacherService.createFromUser(createTeacherFromUserDto);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }

  @Get('organization/:organizationId')
  findByOrganizationId(@Param('organizationId') organizationId: string) {
    return this.teacherService.findByOrganizationId(organizationId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.teacherService.findByUserId(userId);
  }

  @Post(':id/courses/:courseId')
  addCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.teacherService.addCourse(id, courseId);
  }

  @Delete(':id/courses/:courseId')
  removeCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.teacherService.removeCourse(id, courseId);
  }

  @Post(':id/rating')
  addRating(@Param('id') id: string, @Body('rating') rating: number) {
    return this.teacherService.addRating(id, rating);
  }

  @Patch(':id/availability/:day')
  updateAvailability(
    @Param('id') id: string,
    @Param('day') day: string,
    @Body('timeSlots') timeSlots: { startTime: string; endTime: string }[],
  ) {
    return this.teacherService.updateAvailability(id, day, timeSlots);
  }
}
