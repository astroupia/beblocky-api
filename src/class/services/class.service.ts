import {
  Injectable,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ClassRepository } from '../repositories/class.repository';
import { Class, ClassDocument, ClassUserType } from '../entities/class.entity';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto, ExtendClassDto } from '../dtos/update-class.dto';
import { UpdateClassSettingsDto } from '../dtos/update-class-settings.dto';
import { AddStudentDto, RemoveStudentDto } from '../dtos/add-student.dto';
import { AddCourseDto, RemoveCourseDto } from '../dtos/add-course.dto';
import { StudentService } from '../../student/services/student.service';
import { CourseService } from '../../course/services/course.service';
import { OrganizationService } from '../../organization/services/organization.service';
import { ProgressService } from '../../progress/services/progress.service';
import { TeacherService } from '../../teacher/services/teacher.service';
import { Types } from 'mongoose';
import { createObjectId } from '../../utils/object-id.utils';
import { createUserId } from '../../utils/user-id.utils';

@Injectable()
export class ClassService {
  constructor(
    private readonly classRepository: ClassRepository,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => ProgressService))
    private readonly progressService: ProgressService,
    @Inject(forwardRef(() => TeacherService))
    private readonly teacherService: TeacherService,
  ) {}

  /**
   * Create new class
   */
  async create(
    createClassDto: CreateClassDto,
    userId: string,
    userType: ClassUserType,
  ): Promise<ClassDocument> {
    const {
      className,
      description,
      courses = [],
      students = [],
      maxStudents,
      startDate,
      endDate,
      settings,
      metadata,
    } = createClassDto;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!userType) {
      throw new BadRequestException('User type is required');
    }

    // Validate courses exist
    try {
      for (const courseId of courses) {
        if (!courseId || typeof courseId !== 'string') {
          throw new BadRequestException(`Invalid course ID: ${courseId}`);
        }
        await this.courseService.findById(courseId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Course validation failed: ${errorMessage}`,
      );
    }

    // Validate students exist
    try {
      for (const studentId of students) {
        if (!studentId || typeof studentId !== 'string') {
          throw new BadRequestException(`Invalid student ID: ${studentId}`);
        }
        await this.studentService.findOne(studentId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Student validation failed: ${errorMessage}`,
      );
    }

    // Validate organization if teacher
    let organizationId: Types.ObjectId | undefined;
    if (userType === ClassUserType.TEACHER) {
      // For teachers, we can either:
      // 1. Get organization ID from the payload (if provided)
      // 2. Get it from the teacher's profile
      // 3. Allow classes without organization (for now, we'll allow this)

      // If organizationId is provided in the payload, validate it
      if (createClassDto.organizationId) {
        try {
          await this.organizationService.findById(
            createClassDto.organizationId,
          );
          organizationId = createObjectId(
            createClassDto.organizationId,
            'organizationId',
          );
        } catch (error) {
          throw new BadRequestException('Invalid organization ID provided');
        }
      }
      // If no organizationId is provided, we'll allow the class to be created without it
      // This can be updated later to automatically fetch from teacher profile
    }

    // Check max students limit
    if (maxStudents && students.length > maxStudents) {
      throw new BadRequestException(
        `Cannot add ${students.length} students. Maximum allowed is ${maxStudents}`,
      );
    }

    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const classData: Partial<Class> = {
      className,
      description,
      createdBy: {
        userId: createUserId(userId, 'userId'),
        userType,
      },
      organizationId,
      courses: courses.map((id) => createObjectId(id, 'courseId')),
      students: students.map((id) => createObjectId(id, 'studentId')),
      maxStudents,
      isActive: true,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      settings: settings
        ? {
            allowStudentEnrollment: settings.allowStudentEnrollment ?? false,
            requireApproval: settings.requireApproval ?? true,
            autoProgress: settings.autoProgress ?? true,
          }
        : {
            allowStudentEnrollment: false,
            requireApproval: true,
            autoProgress: true,
          },
      metadata,
    };

    try {
      const createdClass = await this.classRepository.create(classData);

      // Auto-enroll students in all courses and create progress records (only if courses exist)
      if (courses.length > 0 && students.length > 0) {
        for (const studentId of students) {
          for (const courseId of courses) {
            // Enroll student in course
            await this.studentService.enrollInCourse(studentId, courseId);

            // Create progress record
            await this.progressService.create({
              studentId,
              courseId,
            });
          }
        }
      }

      return createdClass;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Failed to create class: ${errorMessage}`);
    }
  }

  /**
   * Get class by ID
   */
  async findById(id: string): Promise<ClassDocument> {
    return this.classRepository.findById(id);
  }

  /**
   * Get all classes
   */
  async findAll(): Promise<ClassDocument[]> {
    return this.classRepository.findAll();
  }

  /**
   * Get classes by creator
   */
  async findByCreator(
    userId: string,
    userType: string,
  ): Promise<ClassDocument[]> {
    return this.classRepository.findByCreator(userId, userType);
  }

  /**
   * Get classes by course
   */
  async findByCourse(courseId: string): Promise<ClassDocument[]> {
    return this.classRepository.findByCourse(courseId);
  }

  /**
   * Get classes by student
   */
  async findByStudent(studentId: string): Promise<ClassDocument[]> {
    return this.classRepository.findByStudent(studentId);
  }

  /**
   * Get classes by organization
   */
  async findByOrganization(organizationId: string): Promise<ClassDocument[]> {
    return this.classRepository.findByOrganization(organizationId);
  }

  /**
   * Update class
   */
  async update(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<ClassDocument> {
    const classData = await this.findById(id);

    // Validate courses if being updated
    if (updateClassDto.courses) {
      for (const courseId of updateClassDto.courses) {
        await this.courseService.findById(courseId);
      }
    }

    // Validate students if being updated
    if (updateClassDto.students) {
      for (const studentId of updateClassDto.students) {
        await this.studentService.findOne(studentId);
      }
    }

    const entity: any = { ...updateClassDto };

    if (updateClassDto.courses) {
      entity.courses = updateClassDto.courses.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (updateClassDto.students) {
      entity.students = updateClassDto.students.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (updateClassDto.startDate) {
      entity.startDate = new Date(updateClassDto.startDate);
    }
    if (updateClassDto.endDate) {
      entity.endDate = new Date(updateClassDto.endDate);
    }

    const updatedClass = await this.classRepository.findByIdAndUpdate(
      id,
      entity,
    );

    // Check and update active status
    await this.checkAndUpdateActiveStatus(id);

    return updatedClass;
  }

  /**
   * Update class settings
   */
  async updateSettings(
    id: string,
    updateSettingsDto: UpdateClassSettingsDto,
  ): Promise<ClassDocument> {
    const classData = await this.findById(id);

    // Merge existing settings with new settings, ensuring all required properties are present
    const currentSettings = classData.settings || {
      allowStudentEnrollment: false,
      requireApproval: true,
      autoProgress: true,
    };

    const updatedSettings = {
      allowStudentEnrollment:
        updateSettingsDto.allowStudentEnrollment ??
        currentSettings.allowStudentEnrollment,
      requireApproval:
        updateSettingsDto.requireApproval ?? currentSettings.requireApproval,
      autoProgress:
        updateSettingsDto.autoProgress ?? currentSettings.autoProgress,
    };

    const updatedClass = await this.classRepository.findByIdAndUpdate(id, {
      settings: updatedSettings,
    });

    return updatedClass;
  }

  /**
   * Delete class
   */
  async delete(id: string): Promise<void> {
    await this.classRepository.findByIdAndDelete(id);
  }

  /**
   * Add student to class (creator can add at will)
   */
  async addStudent(
    classId: string,
    addStudentDto: AddStudentDto,
  ): Promise<ClassDocument> {
    const { studentId } = addStudentDto;
    const classData = await this.findById(classId);

    // Check if student is already in class
    if (classData.students.some((id) => id.toString() === studentId)) {
      throw new BadRequestException('Student is already in this class');
    }

    // Check max students limit
    if (
      classData.maxStudents &&
      classData.students.length >= classData.maxStudents
    ) {
      throw new BadRequestException(
        `Class is at maximum capacity of ${classData.maxStudents} students`,
      );
    }

    // Validate student exists
    await this.studentService.findOne(studentId);

    // Add student to class
    const updatedClass = await this.classRepository.addStudent(
      classId,
      studentId,
    );

    // Auto-enroll student in all courses in the class
    for (const courseId of classData.courses) {
      // Enroll student in course
      await this.studentService.enrollInCourse(studentId, courseId.toString());

      // Create progress record for student-course pair
      await this.progressService.create({
        studentId,
        courseId: courseId.toString(),
      });
    }

    return updatedClass;
  }

  /**
   * Remove student from class
   */
  async removeStudent(
    classId: string,
    removeStudentDto: RemoveStudentDto,
  ): Promise<ClassDocument> {
    const { studentId } = removeStudentDto;
    const classData = await this.findById(classId);

    // Check if student is in class
    if (!classData.students.some((id) => id.toString() === studentId)) {
      throw new BadRequestException('Student is not in this class');
    }

    // Remove student from class
    const updatedClass = await this.classRepository.removeStudent(
      classId,
      studentId,
    );

    // Unenroll student from all courses in the class
    for (const courseId of classData.courses) {
      await this.studentService.unenrollFromCourse(
        studentId,
        courseId.toString(),
      );
    }

    return updatedClass;
  }

  /**
   * Add course to class
   */
  async addCourse(
    classId: string,
    addCourseDto: AddCourseDto,
  ): Promise<ClassDocument> {
    const { courseId } = addCourseDto;
    const classData = await this.findById(classId);

    // Check if course is already in class
    if (classData.courses.some((id) => id.toString() === courseId)) {
      throw new BadRequestException('Course is already in this class');
    }

    // Validate course exists
    await this.courseService.findById(courseId);

    // Add course to class
    const updatedClass = await this.classRepository.addCourse(
      classId,
      courseId,
    );

    // Enroll all students in the new course
    for (const studentId of classData.students) {
      // Enroll student in course
      await this.studentService.enrollInCourse(studentId.toString(), courseId);

      // Create progress record for student-course pair
      await this.progressService.create({
        studentId: studentId.toString(),
        courseId,
      });
    }

    return updatedClass;
  }

  /**
   * Remove course from class
   */
  async removeCourse(
    classId: string,
    removeCourseDto: RemoveCourseDto,
  ): Promise<ClassDocument> {
    const { courseId } = removeCourseDto;
    const classData = await this.findById(classId);

    // Check if course is in class
    if (!classData.courses.some((id) => id.toString() === courseId)) {
      throw new BadRequestException('Course is not in this class');
    }

    // Remove course from class
    const updatedClass = await this.classRepository.removeCourse(
      classId,
      courseId,
    );

    // Unenroll all students from the removed course
    for (const studentId of classData.students) {
      await this.studentService.unenrollFromCourse(
        studentId.toString(),
        courseId,
      );
    }

    return updatedClass;
  }

  /**
   * Extend class end date
   */
  async extendEndDate(
    classId: string,
    extendClassDto: ExtendClassDto,
  ): Promise<ClassDocument> {
    const { endDate } = extendClassDto;
    const classData = await this.findById(classId);

    // Validate new end date is after current end date
    if (classData.endDate && new Date(endDate) <= classData.endDate) {
      throw new BadRequestException(
        'New end date must be after current end date',
      );
    }

    const updatedClass = await this.classRepository.findByIdAndUpdate(classId, {
      endDate: new Date(endDate),
    });

    // Check if this makes the class active again
    await this.checkAndUpdateActiveStatus(classId);

    return updatedClass;
  }

  /**
   * Check and update active status based on end date
   */
  async checkAndUpdateActiveStatus(classId: string): Promise<void> {
    const classData = await this.findById(classId);
    const now = new Date();

    if (classData.endDate && now > classData.endDate) {
      // Class has ended, set to inactive
      await this.classRepository.updateActiveStatus(classId, false);
    } else if (classData.endDate && now <= classData.endDate) {
      // Class is still active
      await this.classRepository.updateActiveStatus(classId, true);
    }
  }

  /**
   * Get class statistics
   */
  async getClassStats(classId: string): Promise<{
    totalStudents: number;
    totalCourses: number;
    averageProgress: number;
    activeStudents: number;
  }> {
    const classData = await this.findById(classId);

    let totalProgress = 0;
    let activeStudents = 0;

    // Calculate average progress across all students and courses
    for (const studentId of classData.students) {
      let studentProgress = 0;
      let courseCount = 0;

      for (const courseId of classData.courses) {
        try {
          const progress = await this.progressService.getCompletionPercentage(
            studentId.toString(),
            courseId.toString(),
          );
          studentProgress += progress.percentage;
          courseCount++;
        } catch (error) {
          // Progress record might not exist yet
          courseCount++;
        }
      }

      if (courseCount > 0) {
        totalProgress += studentProgress / courseCount;
        if (studentProgress / courseCount > 0) {
          activeStudents++;
        }
      }
    }

    const averageProgress =
      classData.students.length > 0
        ? totalProgress / classData.students.length
        : 0;

    return {
      totalStudents: classData.students.length,
      totalCourses: classData.courses.length,
      averageProgress: Math.round(averageProgress * 100) / 100,
      activeStudents,
    };
  }

  /**
   * Update all expired classes to inactive
   */
  async updateExpiredClasses(): Promise<void> {
    const expiredClasses = await this.classRepository.findExpiredClasses();

    for (const classData of expiredClasses) {
      await this.classRepository.updateActiveStatus(
        (classData as any)._id.toString(),
        false,
      );
    }
  }
}
