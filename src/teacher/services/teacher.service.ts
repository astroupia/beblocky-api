import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { TeacherRepository } from '../repositories/teacher.repository';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { CreateTeacherFromUserDto } from '../dtos/create-teacher-from-user.dto';
import { UpdateTeacherDto } from '../dtos/update-teacher.dto';
import { Teacher, TeacherDocument } from '../entities/teacher.entity';
import { Types } from 'mongoose';
import { createObjectId } from '../../utils/object-id.utils';
import { createUserId } from '../../utils/user-id.utils';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class TeacherService {
  constructor(
    private readonly teacherRepository: TeacherRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private mapDtoToEntity(dto: Partial<CreateTeacherDto>): Partial<Teacher> {
    const entity: Partial<Teacher> = {
      ...dto,
      organizationId: undefined,
      courses: undefined,
      subscription: undefined,
    };

    if (dto.organizationId) {
      entity.organizationId = createObjectId(
        dto.organizationId,
        'organizationId',
      );
    }

    if (dto.courses) {
      entity.courses = dto.courses.map((id) => createObjectId(id, 'courseId'));
    }

    if (dto.subscription) {
      entity.subscription = createObjectId(dto.subscription, 'subscription');
    }

    return entity;
  }

  private mapFromUserDtoToEntity(
    dto: CreateTeacherFromUserDto,
  ): Partial<Teacher> {
    const entity: Partial<Teacher> = {
      userId: createUserId(dto.userId, 'userId'),
      organizationId: undefined,
      courses: undefined,
      subscription: undefined,
    };

    if (dto.organizationId) {
      entity.organizationId = createObjectId(
        dto.organizationId,
        'organizationId',
      );
    }

    if (dto.courses) {
      entity.courses = dto.courses.map((id) => createObjectId(id, 'courseId'));
    }

    if (dto.subscription) {
      entity.subscription = createObjectId(dto.subscription, 'subscription');
    }

    // Copy other fields
    if (dto.qualifications) entity.qualifications = dto.qualifications;
    if (dto.availability) entity.availability = dto.availability;
    if (dto.rating) entity.rating = dto.rating;
    if (dto.languages) entity.languages = dto.languages;

    return entity;
  }

  async create(createTeacherDto: CreateTeacherDto): Promise<TeacherDocument> {
    const entity = this.mapDtoToEntity(createTeacherDto);
    return this.teacherRepository.create(entity);
  }

  async createFromUser(
    createTeacherFromUserDto: CreateTeacherFromUserDto,
  ): Promise<TeacherDocument> {
    // Get user information to include email
    const user = await this.userService.findOne(
      createTeacherFromUserDto.userId,
    );

    const entity = this.mapFromUserDtoToEntity(createTeacherFromUserDto);
    const createdTeacher = await this.teacherRepository.create(entity);

    // Return teacher with user email included
    return {
      ...createdTeacher.toObject(),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    } as TeacherDocument;
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

  async findByUserId(userId: string): Promise<TeacherDocument> {
    return this.teacherRepository.findByUserId(userId);
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
