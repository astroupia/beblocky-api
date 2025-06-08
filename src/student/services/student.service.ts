import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';
import { Student } from '../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentRepository.create(createStudentDto);
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepository.findAll();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.studentRepository.findByIdAndUpdate(
      id,
      updateStudentDto,
    );
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async remove(id: string): Promise<Student> {
    const student = await this.studentRepository.findByIdAndDelete(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async enrollInCourse(studentId: string, courseId: string): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.addToEnrolledCourses(studentId, courseId);
  }

  async unenrollFromCourse(
    studentId: string,
    courseId: string,
  ): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.removeFromEnrolledCourses(
      studentId,
      courseId,
    );
  }

  async addCoins(studentId: string, amount: number): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.addCoins(studentId, amount);
  }

  async addGoal(studentId: string, goal: string): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.addGoal(studentId, goal);
  }
}
