import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionDocument } from '../entities/subscription.entity';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dtos/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionRepository.create(createSubscriptionDto);
  }

  async findAll(): Promise<SubscriptionDocument[]> {
    return this.subscriptionRepository.findAll();
  }

  async findById(id: string): Promise<SubscriptionDocument> {
    return this.subscriptionRepository.findById(id);
  }

  async findByUserId(userId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionRepository.update(id, updateSubscriptionDto);
  }

  async delete(id: string): Promise<void> {
    return this.subscriptionRepository.delete(id);
  }

  async findByStatus(status: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionRepository.findByStatus(status);
  }

  async findByPlan(planName: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionRepository.findByPlan(planName);
  }

  async findActiveSubscriptions(): Promise<SubscriptionDocument[]> {
    return this.subscriptionRepository.findActiveSubscriptions();
  }

  async findExpiringSubscriptions(
    days: number,
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionRepository.findExpiringSubscriptions(days);
  }
}
