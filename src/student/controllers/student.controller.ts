import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentService } from '../services/student.service';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { CreateStudentFromUserDto } from '../dtos/create-student-from-user.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Post('from-user')
  createFromUser(@Body() createStudentFromUserDto: CreateStudentFromUserDto) {
    return this.studentService.createFromUser(createStudentFromUserDto);
  }

  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }

  @Post(':id/enroll/:courseId')
  enrollInCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.studentService.enrollInCourse(id, courseId);
  }

  @Post(':id/unenroll/:courseId')
  unenrollFromCourse(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studentService.unenrollFromCourse(id, courseId);
  }

  @Post(':id/coins')
  addCoins(@Param('id') id: string, @Body('amount') amount: number) {
    return this.studentService.addCoins(id, amount);
  }

  @Post(':id/goals')
  addGoal(@Param('id') id: string, @Body('goal') goal: string) {
    return this.studentService.addGoal(id, goal);
  }

  @Get(':id/streak')
  getCodingStreak(@Param('id') id: string) {
    return this.studentService.getCodingStreak(id);
  }

  @Patch(':id/activity')
  updateCodingActivity(@Param('id') id: string) {
    return this.studentService.updateCodingStreak(id);
  }

  @Get(':id/coins/total')
  getTotalCoinsEarned(@Param('id') id: string) {
    return this.studentService.getTotalCoinsEarned(id);
  }

  @Post(':id/coins/add')
  addCoinsAndUpdateTotal(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.studentService.addCoinsAndUpdateTotal(id, amount);
  }

  @Patch(':id/time-spent')
  updateTotalTimeSpent(
    @Param('id') id: string,
    @Body('minutes') minutes: number,
  ) {
    return this.studentService.updateTotalTimeSpent(id, minutes);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.studentService.findByUserId(userId);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.studentService.findByEmail(email);
  }
}
