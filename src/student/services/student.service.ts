import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { StudentRepository } from '../repositories/student.repository';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { CreateStudentFromUserDto } from '../dtos/create-student-from-user.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';
import { Student, StudentDocument } from '../entities/student.entity';
import { Types } from 'mongoose';
import { createObjectId } from '../../utils/object-id.utils';
import { createUserId } from '../../utils/user-id.utils';
import { UserService } from '../../user/services/user.service';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
} from '../../subscription/entities/subscription.entity';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private mapDtoToEntity(dto: Partial<CreateStudentDto>): Partial<Student> {
    const entity: Partial<Student> = {
      ...dto,
      parentId: undefined,
      enrolledCourses: undefined,
      schoolId: undefined,
    };

    if (dto.parentId) {
      entity.parentId = createObjectId(dto.parentId, 'parentId');
    }

    if (dto.enrolledCourses) {
      entity.enrolledCourses = dto.enrolledCourses.map((id) =>
        createObjectId(id, 'courseId'),
      );
    }

    if (dto.schoolId) {
      entity.schoolId = createObjectId(dto.schoolId, 'schoolId');
    }

    return entity;
  }

  private mapFromUserDtoToEntity(
    dto: CreateStudentFromUserDto,
  ): Partial<Student> {
    const entity: Partial<Student> = {
      userId: createUserId(dto.userId, 'userId'),
      parentId: undefined,
      enrolledCourses: undefined,
      schoolId: undefined,
    };

    if (dto.parentId) {
      entity.parentId = createObjectId(dto.parentId, 'parentId');
    }

    if (dto.enrolledCourses) {
      entity.enrolledCourses = dto.enrolledCourses.map((id) =>
        createObjectId(id, 'courseId'),
      );
    }

    if (dto.schoolId) {
      entity.schoolId = createObjectId(dto.schoolId, 'schoolId');
    }

    // Copy other fields
    if (dto.dateOfBirth) entity.dateOfBirth = dto.dateOfBirth;
    if (dto.grade) entity.grade = dto.grade;
    if (dto.gender) entity.gender = dto.gender;
    if (dto.coins) entity.coins = dto.coins;
    if (dto.codingStreak) entity.codingStreak = dto.codingStreak;
    if (dto.lastCodingActivity)
      entity.lastCodingActivity = dto.lastCodingActivity;
    if (dto.totalCoinsEarned) entity.totalCoinsEarned = dto.totalCoinsEarned;
    if (dto.totalTimeSpent) entity.totalTimeSpent = dto.totalTimeSpent;
    if (dto.goals) entity.goals = dto.goals;
    if (dto.subscription) entity.subscription = dto.subscription;
    if (dto.emergencyContact) entity.emergencyContact = dto.emergencyContact;
    if (dto.section) entity.section = dto.section;

    return entity;
  }

  private async createFreeTierSubscription(userId: string): Promise<void> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now

      await this.subscriptionService.create({
        userId: userId,
        planName: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        startDate: startDate,
        endDate: endDate,
        autoRenew: true,
        price: 0,
        currency: 'USD',
        billingCycle: BillingCycle.MONTHLY,
        features: [
          'Basic access',
          'Limited courses',
          'Community support',
          'Student learning tools',
          'Progress tracking',
        ],
        lastPaymentDate: startDate,
        nextBillingDate: new Date(
          startDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        ), // 30 days
        cancelAtPeriodEnd: false,
      });
    } catch (error) {
      console.error(
        'Error creating free tier subscription for student:',
        error,
      );
      // Don't throw error to avoid breaking student creation
    }
  }

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    const entity = this.mapDtoToEntity(createStudentDto);
    return this.studentRepository.create(entity);
  }

  async createFromUser(
    createStudentFromUserDto: CreateStudentFromUserDto,
  ): Promise<StudentDocument> {
    try {
      // Check if student already exists for this user
      const existingStudent = await this.studentRepository.findByUserId(
        createStudentFromUserDto.userId,
      );

      if (existingStudent) {
        console.log(
          `Student already exists for user: ${createStudentFromUserDto.userId}`,
        );
        return existingStudent;
      }

      // Get user information to include email
      const user = await this.userService.findOne(
        createStudentFromUserDto.userId,
      );

      const entity = this.mapFromUserDtoToEntity(createStudentFromUserDto);
      const createdStudent = await this.studentRepository.create(entity);

      // Create free tier subscription for the student
      await this.createFreeTierSubscription(createStudentFromUserDto.userId);

      // Return student with user email included
      return {
        ...createdStudent.toObject(),
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      } as StudentDocument;
    } catch (error) {
      console.error('Error in createFromUser (Student):', error);
      throw error;
    }
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

  async updateCodingStreak(studentId: string): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const now = new Date();
    const lastActivity = student.lastCodingActivity;

    if (!lastActivity) {
      // First coding activity
      return this.studentRepository.findByIdAndUpdate(studentId, {
        codingStreak: 1,
        lastCodingActivity: now,
      });
    }

    const timeDiff = now.getTime() - lastActivity.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change to streak
      return student;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      return this.studentRepository.findByIdAndUpdate(studentId, {
        codingStreak: student.codingStreak + 1,
        lastCodingActivity: now,
      });
    } else {
      // Streak broken, reset to 1
      return this.studentRepository.findByIdAndUpdate(studentId, {
        codingStreak: 1,
        lastCodingActivity: now,
      });
    }
  }

  async getCodingStreak(studentId: string): Promise<number> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student.codingStreak;
  }

  async addCoinsAndUpdateTotal(
    studentId: string,
    amount: number,
  ): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const newCoins = student.coins + amount;
    const newTotalCoinsEarned = student.totalCoinsEarned + amount;

    return this.studentRepository.findByIdAndUpdate(studentId, {
      coins: newCoins,
      totalCoinsEarned: newTotalCoinsEarned,
    });
  }

  async updateTotalTimeSpent(
    studentId: string,
    minutes: number,
  ): Promise<StudentDocument> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const newTotalTimeSpent = student.totalTimeSpent + minutes;
    return this.studentRepository.findByIdAndUpdate(studentId, {
      totalTimeSpent: newTotalTimeSpent,
    });
  }

  async getTotalCoinsEarned(studentId: string): Promise<number> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    return student.totalCoinsEarned;
  }

  async findByUserId(userId: string): Promise<StudentDocument> {
    return this.studentRepository.findByUserId(userId);
  }

  async findByEmail(email: string): Promise<StudentDocument> {
    return this.studentRepository.findByEmail(email);
  }

  async findByParentId(parentId: string): Promise<StudentDocument[]> {
    return this.studentRepository.findByParentId(parentId);
  }
}
