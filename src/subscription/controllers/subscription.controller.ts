import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dtos/update-subscription.dto';
import { SubscriptionDocument } from '../entities/subscription.entity';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  findAll(): Promise<SubscriptionDocument[]> {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SubscriptionDocument> {
    return this.subscriptionService.findById(id);
  }

  @Get('user/:userId')
  findByUserId(
    @Param('userId') userId: string,
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionService.findByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionService.delete(id);
  }

  @Get('status/:status')
  findByStatus(
    @Param('status') status: string,
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionService.findByStatus(status);
  }

  @Get('plan/:planName')
  findByPlan(
    @Param('planName') planName: string,
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionService.findByPlan(planName);
  }

  @Get('active/all')
  findActiveSubscriptions(): Promise<SubscriptionDocument[]> {
    return this.subscriptionService.findActiveSubscriptions();
  }

  @Get('expiring')
  findExpiringSubscriptions(
    @Query('days') days: number,
  ): Promise<SubscriptionDocument[]> {
    return this.subscriptionService.findExpiringSubscriptions(days);
  }
}
