import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Message interface for chat history
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    lessonId?: string;
    slideId?: string;
    courseContext?: any;
  };
}

// Domain entity
export class AiConversation {
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  title?: string;
  messages: ChatMessage[];
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'ai_conversations' })
export class AiConversationSchemaClass {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: false })
  title?: string;

  @Prop({
    type: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        metadata: {
          lessonId: String,
          slideId: String,
          courseContext: Object,
        },
      },
    ],
    default: [],
  })
  messages: ChatMessage[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastActivity: Date;
}

export const AiConversationSchema = SchemaFactory.createForClass(
  AiConversationSchemaClass,
);

// Add indexes for efficient queries
AiConversationSchema.index({ courseId: 1, studentId: 1 });
AiConversationSchema.index({ studentId: 1, isActive: 1 });
AiConversationSchema.index({ lastActivity: -1 });

export type AiConversationDocument = AiConversationSchemaClass & Document;
