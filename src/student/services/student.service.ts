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

  /**
   * Update coding streak based on activity
   * @param studentId - Student ID
   * @returns Updated student document
   */
  async updateCodingStreak(studentId: string): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const now = new Date();
    const lastActivity = student.lastCodingActivity;

    if (!lastActivity) {
      // First activity
      student.codingStreak = 1;
    } else {
      const daysDiff = Math.floor(
        (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 0) {
        // Same day, maintain streak
        // No change needed
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        student.codingStreak += 1;
      } else {
        // Streak broken, reset to 1
        student.codingStreak = 1;
      }
    }

    student.lastCodingActivity = now;
    return this.studentRepository.findByIdAndUpdate(studentId, student);
  }

  /**
   * Get current coding streak for a student
   * @param studentId - Student ID
   * @returns Current streak count
   */
  async getCodingStreak(studentId: string): Promise<number> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student.codingStreak;
  }

  /**
   * Add coins to student and update total coins earned
   * @param studentId - Student ID
   * @param amount - Amount of coins to add
   * @returns Updated student document
   */
  async addCoinsAndUpdateTotal(
    studentId: string,
    amount: number,
  ): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Update both current coins and total coins earned
    student.coins += amount;
    student.totalCoinsEarned += amount;

    return this.studentRepository.findByIdAndUpdate(studentId, student);
  }

  /**
   * Update total time spent learning
   * @param studentId - Student ID
   * @param minutes - Minutes to add to total time
   * @returns Updated student document
   */
  async updateTotalTimeSpent(
    studentId: string,
    minutes: number,
  ): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    student.totalTimeSpent += minutes;
    return this.studentRepository.findByIdAndUpdate(studentId, student);
  }

  /**
   * Get total coins earned by student
   * @param studentId - Student ID
   * @returns Total coins earned
   */
  async getTotalCoinsEarned(studentId: string): Promise<number> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student.totalCoinsEarned;
  }
}
