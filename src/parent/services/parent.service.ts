import {
  Injectable,
  forwardRef,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ParentRepository } from '../repositories/parent.repository';
import { ParentDocument } from '../entities/parent.entity';
import { CreateParentDto } from '../dtos/create-parent.dto';
import { CreateParentFromUserDto } from '../dtos/create-parent-from-user.dto';
import { UpdateParentDto } from '../dtos/update-parent.dto';
import { AddChildDto } from '../dtos/add-child.dto';
import { createUserId } from '../../utils/user-id.utils';
import { createObjectId } from '../../utils/object-id.utils';
import { UserService } from '../../user/services/user.service';
import { StudentService } from '../../student/services/student.service';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
} from '../../subscription/entities/subscription.entity';

@Injectable()
export class ParentService {
  constructor(
    private readonly parentRepository: ParentRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private mapFromUserDtoToEntity(
    dto: CreateParentFromUserDto,
  ): Partial<ParentDocument> {
    const { userId, children, ...restDto } = dto;
    const entity: Partial<ParentDocument> = {
      userId: createUserId(userId, 'userId'),
      ...restDto,
    };

    if (children) {
      entity.children = children.map((id) => createObjectId(id, 'childId'));
    }

    return entity;
  }

  async create(createParentDto: CreateParentDto): Promise<ParentDocument> {
    return this.parentRepository.create(createParentDto);
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
          'Parent dashboard access',
        ],
        lastPaymentDate: startDate,
        nextBillingDate: new Date(
          startDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        ), // 30 days
        cancelAtPeriodEnd: false,
      });
    } catch (error) {
      console.error('Error creating free tier subscription for parent:', error);
      // Don't throw error to avoid breaking parent creation
    }
  }

  async createFromUser(
    createParentFromUserDto: CreateParentFromUserDto,
  ): Promise<ParentDocument> {
    try {
      // Get user information to include email
      const user = await this.userService.findOne(
        createParentFromUserDto.userId,
      );

      const entity = this.mapFromUserDtoToEntity(createParentFromUserDto);
      const createdParent = await this.parentRepository.create(entity);

      // Create free tier subscription for the parent
      await this.createFreeTierSubscription(createParentFromUserDto.userId);

      // Return parent with user email included
      return {
        ...createdParent.toObject(),
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      } as ParentDocument;
    } catch (error) {
      console.error('Error in createFromUser (Parent):', error);
      throw error;
    }
  }

  async findById(id: string): Promise<ParentDocument> {
    return this.parentRepository.findById(id);
  }

  async findAll(): Promise<ParentDocument[]> {
    return this.parentRepository.findAll();
  }

  async update(
    id: string,
    updateParentDto: UpdateParentDto,
  ): Promise<ParentDocument> {
    return this.parentRepository.update(id, updateParentDto);
  }

  async delete(id: string): Promise<void> {
    await this.parentRepository.delete(id);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<ParentDocument> {
    return this.parentRepository.findByPhoneNumber(phoneNumber);
  }

  async findByUserId(userId: string): Promise<ParentDocument> {
    return this.parentRepository.findByUserId(userId);
  }

  // New methods for children management
  async getChildren(parentId: string) {
    const parent = await this.parentRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Parent with ID ${parentId} not found`);
    }

    // Get children with populated data
    const children = await this.studentService.findByParentId(parentId);
    return children;
  }

  async getParentWithChildren(parentId: string) {
    const parent = await this.parentRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Parent with ID ${parentId} not found`);
    }

    // Get children with populated data
    const children = await this.studentService.findByParentId(parentId);

    return {
      ...parent.toObject(),
      children: children,
    };
  }

  async addChild(parentId: string, addChildDto: AddChildDto) {
    const { email, dateOfBirth, ...studentData } = addChildDto;

    // 1. Check if user exists by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // 2. Check if parent exists
    const parent = await this.parentRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Parent with ID ${parentId} not found`);
    }

    // 3. Check if student already exists for this user
    let student;
    try {
      student = await this.studentService.findByUserId(user._id);
    } catch (error) {
      // Student doesn't exist, will create new one
    }

    // Prepare student data with proper date conversion
    const processedStudentData = {
      ...studentData,
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
    };

    if (student) {
      // Update existing student with parent ID
      student = await this.studentService.update(student._id.toString(), {
        parentId: parentId,
        ...processedStudentData,
      });
    } else {
      // Create new student
      student = await this.studentService.createFromUser({
        userId: user._id,
        parentId: parentId,
        ...processedStudentData,
      });
    }

    // 4. Update parent's children array
    const updatedParent = await this.parentRepository.addChild(
      parentId,
      student._id,
    );

    return {
      parent: updatedParent,
      student: student,
    };
  }
}
