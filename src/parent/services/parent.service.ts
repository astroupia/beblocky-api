import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { ParentRepository } from '../repositories/parent.repository';
import { ParentDocument } from '../entities/parent.entity';
import { CreateParentDto } from '../dtos/create-parent.dto';
import { CreateParentFromUserDto } from '../dtos/create-parent-from-user.dto';
import { UpdateParentDto } from '../dtos/update-parent.dto';
import { createUserId } from '../../utils/user-id.utils';
import { createObjectId } from '../../utils/object-id.utils';
import { UserService } from '../../user/services/user.service';
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
}
