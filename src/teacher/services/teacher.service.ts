import { Injectable, NotFoundException } from '@nestjs/common';
import { TeacherRepository } from '../repositories/teacher.repository';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { UpdateTeacherDto } from '../dtos/update-teacher.dto';
import { Teacher, TeacherDocument } from '../entities/teacher.entity';
import { Types } from 'mongoose';

@Injectable()
export class TeacherService {
  constructor(private readonly teacherRepository: TeacherRepository) {}

  private mapDtoToEntity(dto: Partial<CreateTeacherDto>): Partial<Teacher> {
    const entity: Partial<Teacher> = { ...dto };

    if (dto.organizationId) {
      entity.organizationId = new Types.ObjectId(dto.organizationId);
    }

    if (dto.courses) {
      entity.courses = dto.courses.map((id) => new Types.ObjectId(id));
    }

    if (dto.subscription) {
      entity.subscription = new Types.ObjectId(dto.subscription);
    }

    return entity;
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<TeacherDocument> {
    const entity = this.mapDtoToEntity(createTeacherDto);
    return this.teacherRepository.create(entity);
  }

  async findAll(): Promise<TeacherDocument[]> {
    return this.teacherRepository.findAll();
  }

  async findOne(id: string): Promise<TeacherDocument> {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async update(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<TeacherDocument> {
    const entity = this.mapDtoToEntity(updateTeacherDto);
    const teacher = await this.teacherRepository.findByIdAndUpdate(id, entity);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async remove(id: string): Promise<void> {
    const teacher = await this.teacherRepository.findByIdAndDelete(id);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<TeacherDocument[]> {
    return this.teacherRepository.findByOrganizationId(organizationId);
  }

  async addCourse(
    teacherId: string,
    courseId: string,
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return this.teacherRepository.addCourse(teacherId, courseId);
  }

  async removeCourse(
    teacherId: string,
    courseId: string,
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return this.teacherRepository.removeCourse(teacherId, courseId);
  }

  async addRating(teacherId: string, rating: number): Promise<TeacherDocument> {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return this.teacherRepository.addRating(teacherId, rating);
  }

  async updateAvailability(
    teacherId: string,
    day: string,
    timeSlots: { startTime: string; endTime: string }[],
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
    return this.teacherRepository.updateAvailability(teacherId, day, timeSlots);
  }
}
