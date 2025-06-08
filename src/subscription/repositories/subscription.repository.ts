import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from '../entities/subscription.entity';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dtos/update-subscription.dto';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    const createdSubscription = new this.subscriptionModel(
      createSubscriptionDto,
    );
    return createdSubscription.save();
  }

  async findAll(): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find().exec();
  }

  async findById(id: string): Promise<SubscriptionDocument> {
    const subscription = await this.subscriptionModel.findById(id).exec();
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async findByUserId(userId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ userId }).exec();
  }

  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    const updatedSubscription = await this.subscriptionModel
      .findByIdAndUpdate(id, updateSubscriptionDto, { new: true })
      .exec();
    if (!updatedSubscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return updatedSubscription;
  }

  async delete(id: string): Promise<void> {
    const result = await this.subscriptionModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  async findByStatus(status: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ status }).exec();
  }

  async findByPlan(planName: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel.find({ planName }).exec();
  }

  async findActiveSubscriptions(): Promise<SubscriptionDocument[]> {
    const now = new Date();
    return this.subscriptionModel
      .find({
        status: 'active',
        endDate: { $gt: now },
      })
      .exec();
  }

  async findExpiringSubscriptions(
    days: number,
  ): Promise<SubscriptionDocument[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return this.subscriptionModel
      .find({
        status: 'active',
        endDate: { $gt: now, $lt: futureDate },
      })
      .exec();
  }
}
