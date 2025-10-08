import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AiConversation,
  AiConversationDocument,
} from '../entities/ai-conversation.entity';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class AiConversationRepository {
  constructor(
    @InjectModel('AiConversation')
    private readonly aiConversationModel: Model<AiConversationDocument>,
  ) {}

  async create(data: Partial<AiConversation>): Promise<AiConversationDocument> {
    const conversation = new this.aiConversationModel(data);
    return conversation.save();
  }

  async findById(id: string): Promise<AiConversationDocument> {
    const conversation = await this.aiConversationModel
      .findById(id)
      .populate('courseId', 'courseTitle courseDescription courseLanguage')
      .populate('studentId', 'firstName lastName')
      .exec();

    if (!conversation) {
      throw new NotFoundException(`AI Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async findByStudentId(studentId: string): Promise<AiConversationDocument[]> {
    return this.aiConversationModel
      .find({ studentId: createObjectId(studentId, 'studentId') })
      .populate('courseId', 'courseTitle courseDescription courseLanguage')
      .sort({ lastActivity: -1 })
      .exec();
  }

  async findByCourseId(courseId: string): Promise<AiConversationDocument[]> {
    return this.aiConversationModel
      .find({ courseId: createObjectId(courseId, 'courseId') })
      .populate('studentId', 'firstName lastName')
      .sort({ lastActivity: -1 })
      .exec();
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<AiConversationDocument[]> {
    return this.aiConversationModel
      .find({
        studentId: createObjectId(studentId, 'studentId'),
        courseId: createObjectId(courseId, 'courseId'),
      })
      .populate('courseId', 'courseTitle courseDescription courseLanguage')
      .sort({ lastActivity: -1 })
      .exec();
  }

  async save(
    conversation: AiConversationDocument,
  ): Promise<AiConversationDocument> {
    return conversation.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.aiConversationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`AI Conversation with ID ${id} not found`);
    }
  }

  async findAll(): Promise<AiConversationDocument[]> {
    return this.aiConversationModel
      .find()
      .populate('courseId', 'courseTitle courseDescription courseLanguage')
      .populate('studentId', 'firstName lastName')
      .sort({ lastActivity: -1 })
      .exec();
  }

  async updateLastActivity(id: string): Promise<AiConversationDocument> {
    const conversation = await this.aiConversationModel
      .findByIdAndUpdate(id, { lastActivity: new Date() }, { new: true })
      .exec();

    if (!conversation) {
      throw new NotFoundException(`AI Conversation with ID ${id} not found`);
    }

    return conversation;
  }
}
