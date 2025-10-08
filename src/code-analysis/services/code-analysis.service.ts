import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CodeAnalysisRepository } from '../repositories/code-analysis.repository';
import {
  CodeAnalysisDocument,
  CodeFeedback,
  FeedbackType,
} from '../entities/code-analysis.entity';
import { CreateCodeAnalysisDto } from '../dtos/create-code-analysis.dto';
import { ProgressService } from '../../progress/services/progress.service';
import { CourseService } from '../../course/services/course.service';
import { LessonService } from '../../lesson/services/lesson.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class CodeAnalysisService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly codeAnalysisRepository: CodeAnalysisRepository,
    private readonly progressService: ProgressService,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
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
   * Analyze code and provide feedback
   */
  async analyzeCode(
    createDto: CreateCodeAnalysisDto,
  ): Promise<CodeAnalysisDocument> {
    const { progressId, lessonId, codeContent, language, customInstructions } =
      createDto;

    // Verify progress exists and get related data
    const progress = await this.progressService.findById(progressId);
    if (!progress) {
      throw new NotFoundException(`Progress with ID ${progressId} not found`);
    }

    // Verify lesson exists
    const lesson = await this.lessonService.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Get course information
    const course = await this.courseService.findById(
      progress.courseId.toString(),
    );

    // Analyze code using AI
    const analysis = await this.performCodeAnalysis(
      codeContent,
      language,
      lesson,
      course,
      customInstructions,
    );

    // Create analysis record
    const codeAnalysis = await this.codeAnalysisRepository.create({
      progressId: createObjectId(progressId, 'progressId'),
      lessonId: createObjectId(lessonId, 'lessonId'),
      studentId: progress.studentId,
      courseId: progress.courseId,
      codeContent,
      language,
      feedback: analysis.feedback,
      totalPoints: analysis.totalPoints,
      analysisDate: new Date(),
      isCompleted: true,
    });

    return codeAnalysis;
  }

  /**
   * Get code analysis by progress ID
   */
  async findByProgressId(progressId: string): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisRepository.findByProgressId(progressId);
  }

  /**
   * Get code analysis by lesson ID
   */
  async findByLessonId(lessonId: string): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisRepository.findByLessonId(lessonId);
  }

  /**
   * Get code analysis by student ID
   */
  async findByStudentId(studentId: string): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisRepository.findByStudentId(studentId);
  }

  /**
   * Get all analyses for a specific progress-lesson pair
   */
  async findByProgressAndLesson(
    progressId: string,
    lessonId: string,
  ): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisRepository.findByProgressAndLesson(
      progressId,
      lessonId,
    );
  }

  /**
   * Get code analysis by ID
   */
  async findById(id: string): Promise<CodeAnalysisDocument> {
    return await this.codeAnalysisRepository.findById(id);
  }

  /**
   * Get all code analyses
   */
  async findAll(): Promise<CodeAnalysisDocument[]> {
    return await this.codeAnalysisRepository.findAll();
  }

  /**
   * Delete code analysis
   */
  async delete(id: string): Promise<void> {
    return await this.codeAnalysisRepository.delete(id);
  }

  /**
   * Perform AI-powered code analysis
   */
  private async performCodeAnalysis(
    codeContent: string,
    language: string,
    lesson: any,
    course: any,
    customInstructions?: string,
  ): Promise<{ feedback: CodeFeedback[]; totalPoints: number }> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent analysis
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
      });

      // Build analysis prompt
      const analysisPrompt = this.buildAnalysisPrompt(
        codeContent,
        language,
        lesson,
        course,
        customInstructions,
      );

      // Get AI analysis
      const result = await model.generateContent(analysisPrompt);
      const analysisText = result.response.text();

      // Parse AI response into structured feedback
      const feedback = this.parseAnalysisResponse(analysisText);

      // Calculate total points
      const totalPoints = feedback.reduce(
        (sum, item) => sum + (item.points || 0),
        0,
      );

      return { feedback, totalPoints };
    } catch (error) {
      console.error('Error performing code analysis:', error);
      throw new BadRequestException(
        'Failed to analyze code. Please try again.',
      );
    }
  }

  /**
   * Build comprehensive analysis prompt for AI
   */
  private buildAnalysisPrompt(
    codeContent: string,
    language: string,
    lesson: any,
    course: any,
    customInstructions?: string,
  ): string {
    return `You are an expert code reviewer and tutor specializing in ${language} programming.

**Course Context:**
- Course: ${course.courseTitle}
- Language: ${course.courseLanguage}
- Lesson: ${lesson.title}
- Description: ${lesson.description}

**Analysis Task:**
Please analyze the following ${language} code and provide detailed feedback. Focus on:
1. Code correctness and functionality
2. Best practices and conventions for ${language}
3. Readability and maintainability
4. Performance considerations
5. Security aspects (if applicable)
6. Alignment with lesson objectives

**Code to Analyze:**
\`\`\`${language}
${codeContent}
\`\`\`

**Custom Instructions:**
${customInstructions || 'No specific instructions provided.'}

**Response Format:**
Please provide your analysis in the following JSON format:
{
  "feedback": [
    {
      "type": "success|warning|error|info",
      "message": "Clear, specific feedback message",
      "line": 5, // Optional: specific line number if applicable
      "code": "problematic code snippet", // Optional: specific code causing issue
      "suggestion": "How to improve or fix the issue", // Optional
      "points": 10 // Points awarded (positive for good practices, negative for issues)
    }
  ],
  "summary": "Brief overall assessment"
}

**Scoring Guidelines:**
- Success items: +5 to +20 points
- Warning items: -5 to +5 points (depending on severity)
- Error items: -10 to -20 points
- Info items: 0 to +5 points

Provide constructive, encouraging feedback that helps the student learn and improve.`;
  }

  /**
   * Parse AI response into structured feedback
   */
  private parseAnalysisResponse(analysisText: string): CodeFeedback[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.feedback || !Array.isArray(parsed.feedback)) {
        throw new Error('Invalid feedback format in AI response');
      }

      // Validate and enhance feedback items
      const feedback: CodeFeedback[] = parsed.feedback
        .map((item: any) => {
          // Ensure required fields
          if (!item.type || !item.message) {
            return null;
          }

          // Validate feedback type
          if (
            !Object.values(FeedbackType).includes(item.type as FeedbackType)
          ) {
            item.type = FeedbackType.INFO;
          }

          // Set default points if not provided
          if (item.points === undefined) {
            switch (item.type) {
              case FeedbackType.SUCCESS:
                item.points = 10;
                break;
              case FeedbackType.WARNING:
                item.points = -5;
                break;
              case FeedbackType.ERROR:
                item.points = -15;
                break;
              case FeedbackType.INFO:
                item.points = 2;
                break;
            }
          }

          return {
            type: item.type,
            message: item.message,
            line: item.line,
            code: item.code,
            suggestion: item.suggestion,
            points: item.points,
          } as CodeFeedback;
        })
        .filter(Boolean);

      return feedback;
    } catch (error) {
      console.error('Error parsing AI analysis response:', error);

      // Fallback: create basic feedback from the text response
      return [
        {
          type: FeedbackType.INFO,
          message:
            'Code analysis completed. Please review the suggestions below.',
          points: 5,
        },
        {
          type: FeedbackType.INFO,
          message: analysisText.substring(0, 200) + '...',
          points: 0,
        },
      ];
    }
  }

  /**
   * Get code analysis statistics for a student
   */
  async getStudentStats(studentId: string): Promise<{
    totalAnalyses: number;
    averagePoints: number;
    totalPoints: number;
    feedbackBreakdown: { [key in FeedbackType]: number };
  }> {
    const analyses =
      await this.codeAnalysisRepository.findByStudentId(studentId);

    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averagePoints: 0,
        totalPoints: 0,
        feedbackBreakdown: {
          [FeedbackType.SUCCESS]: 0,
          [FeedbackType.WARNING]: 0,
          [FeedbackType.ERROR]: 0,
          [FeedbackType.INFO]: 0,
        },
      };
    }

    const totalPoints = analyses.reduce(
      (sum, analysis) => sum + analysis.totalPoints,
      0,
    );
    const averagePoints = totalPoints / analyses.length;

    const feedbackBreakdown = analyses.reduce(
      (acc, analysis) => {
        analysis.feedback.forEach((feedback) => {
          acc[feedback.type]++;
        });
        return acc;
      },
      {
        [FeedbackType.SUCCESS]: 0,
        [FeedbackType.WARNING]: 0,
        [FeedbackType.ERROR]: 0,
        [FeedbackType.INFO]: 0,
      },
    );

    return {
      totalAnalyses: analyses.length,
      averagePoints: Math.round(averagePoints * 100) / 100,
      totalPoints,
      feedbackBreakdown,
    };
  }
}
