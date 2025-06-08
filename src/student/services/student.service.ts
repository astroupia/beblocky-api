import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';
import { Student, StudentDocument } from '../entities/student.entity';
import { Types } from 'mongoose';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  private mapDtoToEntity(dto: Partial<CreateStudentDto>): Partial<Student> {
    const entity: Partial<Student> = { ...dto };

    if (dto.parentId) {
      entity.parentId = new Types.ObjectId(dto.parentId);
    }

    if (dto.enrolledCourses) {
      entity.enrolledCourses = dto.enrolledCourses.map(
        (id) => new Types.ObjectId(id),
      );
    }

    if (dto.schoolId) {
      entity.schoolId = new Types.ObjectId(dto.schoolId);
    }

    return entity;
  }

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    const entity = this.mapDtoToEntity(createStudentDto);
    return this.studentRepository.create(entity);
  }

  async findAll(): Promise<StudentDocument[]> {
    return this.studentRepository.findAll();
  }

  async findOne(id: string): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentDocument> {
    const entity = this.mapDtoToEntity(updateStudentDto);
    const student = await this.studentRepository.findByIdAndUpdate(id, entity);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async remove(id: string): Promise<void> {
    const student = await this.studentRepository.findByIdAndDelete(id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }

  async enrollInCourse(
    studentId: string,
    courseId: string,
  ): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.addToEnrolledCourses(studentId, courseId);
  }

  async unenrollFromCourse(
    studentId: string,
    courseId: string,
  ): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.removeFromEnrolledCourses(
      studentId,
      courseId,
    );
  }

  async addCoins(studentId: string, amount: number): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.addCoins(studentId, amount);
  }

  async addGoal(studentId: string, goal: string): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return this.studentRepository.addGoal(studentId, goal);
  }
}
