import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AiConversationRepository } from '../repositories/ai-conversation.repository';
import { AiConversationDocument } from '../entities/ai-conversation.entity';
import { CreateAiConversationDto } from '../dtos/create-ai-conversation.dto';
import { SendMessageDto } from '../dtos/send-message.dto';
import { CourseService } from '../../course/services/course.service';
import { LessonService } from '../../lesson/services/lesson.service';
import { SlideService } from '../../slide/services/slide.service';
import { ProgressService } from '../../progress/services/progress.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class AiConversationService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly aiConversationRepository: AiConversationRepository,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
    private readonly slideService: SlideService,
    private readonly progressService: ProgressService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Gemini AI client
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Create a new AI conversation with course context
   */
  async create(
    createDto: CreateAiConversationDto,
  ): Promise<AiConversationDocument> {
    const { courseId, studentId, initialMessage, lessonId, slideId } =
      createDto;

    // Verify course exists
    const course = await this.courseService.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Build course context for AI
    const courseContext = await this.buildCourseContext(courseId, lessonId);

    // Create system message with course context
    const systemMessage = this.buildSystemMessage(course, courseContext);

    // Generate the title based on initialMessage and course context if available
    let generatedTitle: string;
    if (initialMessage && initialMessage.trim().length > 0) {
      // Use the first sentence or 10 words from initialMessage as the base
      const preview =
        initialMessage.split(/[.?!]/)[0] ||
        initialMessage.split(/\s+/).slice(0, 10).join(' ');
      generatedTitle = `Q: ${preview.length > 54 ? preview.slice(0, 54) + '…' : preview}`;
    } else {
      // Default to course title if no message given
      generatedTitle = `Course Conversation: ${course.courseTitle}`;
    }

    const conversation = await this.aiConversationRepository.create({
      courseId: createObjectId(courseId, 'courseId'),
      studentId: createObjectId(studentId, 'studentId'),
      title: generatedTitle,
      messages: [
        {
          role: 'system',
          content: systemMessage,
          timestamp: new Date(),
          metadata: {
            courseContext,
          },
        },
      ],
      isActive: true,
      lastActivity: new Date(),
    });

    // If there's an initial message, process it
    if (initialMessage) {
      await this.sendMessage(String(conversation._id), {
        message: initialMessage,
        lessonId,
        slideId,
      });
    }

    // Ensure the return type is correct and not an error
    if (!conversation || conversation instanceof Error) {
      throw new Error('Failed to create conversation');
    }

    return conversation;
  }

  /**
   * Send a message in an existing conversation
   */
  async sendMessage(
    conversationId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<AiConversationDocument> {
    const { message, lessonId, slideId } = sendMessageDto;

    // Get conversation
    const conversation =
      await this.aiConversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
      metadata: {
        lessonId,
        slideId,
      },
    };

    conversation.messages.push(userMessage);

    // Get AI response using Gemini
    const aiResponse = await this.getAIResponse(conversation);

    // Add AI response
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        lessonId,
        slideId,
      },
    };

    conversation.messages.push(assistantMessage);
    conversation.lastActivity = new Date();

    // Save updated conversation
    const savedConversation =
      await this.aiConversationRepository.save(conversation);
    if (!savedConversation) {
      throw new Error('Failed to save updated conversation');
    }
    return savedConversation;
  }

  /**
   * Get conversation by ID
   */
  async findById(id: string): Promise<AiConversationDocument> {
    const conversation = await this.aiConversationRepository.findById(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  /**
   * Get all conversations for a student
   */
  async findByStudentId(studentId: string): Promise<AiConversationDocument[]> {
    const conversations =
      await this.aiConversationRepository.findByStudentId(studentId);
    if (!conversations) {
      return [];
    }
    return conversations;
  }

  /**
   * Get all conversations
   */
  async findAll(): Promise<AiConversationDocument[]> {
    const conversations = await this.aiConversationRepository.findAll();
    if (!conversations) {
      return [];
    }
    return conversations;
  }

  /**
   * Get all conversations for a course
   */
  async findByCourseId(courseId: string): Promise<AiConversationDocument[]> {
    const conversations =
      await this.aiConversationRepository.findByCourseId(courseId);
    if (!conversations) {
      return [];
    }
    return conversations;
  }

  /**
   * Get conversation history for a specific student-course pair
   */
  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<AiConversationDocument[]> {
    const conversations =
      await this.aiConversationRepository.findByStudentAndCourse(
        studentId,
        courseId,
      );
    if (!conversations) {
      return [];
    }
    return conversations;
  }

  /**
   * Delete a conversation
   */
  async delete(id: string): Promise<void> {
    await this.aiConversationRepository.delete(id);
  }

  /**
   * Build course context for AI
   */
  private async buildCourseContext(
    courseId: string,
    lessonId?: string,
  ): Promise<any> {
    const course = await this.courseService.findById(courseId);
    const context: any = {
      course: {
        id: course._id,
        title: course.courseTitle,
        description: course.courseDescription,
        language: course.courseLanguage,
      },
      lessons: [],
      slides: [],
    };

    // Get lessons if course has them
    if (course.lessons && course.lessons.length > 0) {
      for (const lesson of course.lessons) {
        // Check if lesson is populated (has _id property) or is just an ObjectId
        if (
          lesson &&
          typeof lesson === 'object' &&
          lesson._id &&
          'title' in lesson
        ) {
          // Lesson is already populated, use it directly
          context.lessons.push({
            id: lesson._id,
            title: (lesson as any).title,
            description: (lesson as any).description,
            difficulty: (lesson as any).difficulty,
            duration: (lesson as any).duration,
          });
        } else {
          // Lesson is just an ObjectId, fetch it
          const lessonDoc = await this.lessonService.findById(
            lesson.toString(),
          );
          if (lessonDoc) {
            context.lessons.push({
              id: lessonDoc._id,
              title: lessonDoc.title,
              description: lessonDoc.description,
              difficulty: lessonDoc.difficulty,
              duration: lessonDoc.duration,
            });
          }
        }
      }
    }

    // Get slides if lesson is specified
    if (lessonId) {
      const lesson = await this.lessonService.findById(lessonId);
      if (lesson && lesson.slides) {
        for (const slide of lesson.slides) {
          // Check if slide is populated (has _id property) or is just an ObjectId
          if (
            slide &&
            typeof slide === 'object' &&
            slide._id &&
            'title' in slide
          ) {
            // Slide is already populated, use it directly
            context.slides.push({
              id: slide._id,
              title: (slide as any).title,
              content: (slide as any).content,
              order: (slide as any).order,
            });
          } else {
            // Slide is just an ObjectId, fetch it
            const slideDoc = await this.slideService.findById(slide.toString());
            if (slideDoc) {
              context.slides.push({
                id: slideDoc._id,
                title: slideDoc.title,
                content: slideDoc.content,
                order: slideDoc.order,
              });
            }
          }
        }
      }
    }

    return context;
  }

  /**
   * Build system message with course context
   */
  private buildSystemMessage(course: any, courseContext: any): string {
    return `You are an AI coding tutor specializing in ${course.courseLanguage} programming.

Course Context:
- Course: ${course.courseTitle}
- Description: ${course.courseDescription}
- Programming Language: ${course.courseLanguage}

Available Lessons: ${courseContext.lessons.length}
${courseContext.lessons.map((lesson: any) => `- ${lesson.title}: ${lesson.description}`).join('\n')}

Available Slides: ${courseContext.slides.length}
${courseContext.slides.map((slide: any) => `- ${slide.title}: ${slide.content?.substring(0, 100)}...`).join('\n')}

Your role:
1. Help students understand programming concepts in ${course.courseLanguage}
2. Provide code examples and explanations
3. Answer questions about the course content
4. Guide students through lessons and exercises
5. Offer constructive feedback on their code

Always be encouraging, patient, and focus on building the student's understanding step by step.`;
  }

  /**
   * Get AI response using Gemini API
   */
  private async getAIResponse(
    conversation: AiConversationDocument,
  ): Promise<string> {
    try {
      // Get the model (using Gemini 2.5 Flash as per the guide)
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      // Prepare chat history for the API
      const chatHistory = conversation.messages
        .filter((msg) => msg.role !== 'system') // Exclude system messages from chat history
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }],
        }));

      // Start chat with history
      const chat = model.startChat({
        history: chatHistory,
      });

      // Get the last user message
      const lastUserMessage = conversation.messages
        .filter((msg) => msg.role === 'user')
        .pop();

      if (!lastUserMessage) {
        throw new Error('No user message found');
      }

      // Send message and get response
      const result = await chat.sendMessage(lastUserMessage.content);
      const text = result.response.text();

      return text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new BadRequestException(
        'Failed to get AI response. Please try again.',
      );
    }
  }
}
