import {
  Injectable,
  forwardRef,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProgressRepository } from '../repositories/progress.repository';
import { Progress, ProgressDocument } from '../entities/progress.entity';
import { CreateProgressDto } from '../dtos/create-progress.dto';
import { UpdateProgressDto } from '../dtos/update-progress.dto';
import { CompleteLessonDto } from '../dtos/complete-lesson.dto';
import { SaveCodeDto } from '../dtos/save-code.dto';
import { StudentService } from '../../student/services/student.service';
import { CourseService } from '../../course/services/course.service';
import { LessonService } from '../../lesson/services/lesson.service';
import { Types } from 'mongoose';
import {
  createObjectId,
  createObjectIdIfExists,
} from '../../utils/object-id.utils';

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressRepository: ProgressRepository,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => LessonService))
    private readonly lessonService: LessonService,
  ) {}

  /**
   * Create new progress for a student-course pair
   */
  async create(
    createProgressDto: CreateProgressDto,
  ): Promise<ProgressDocument> {
    const { studentId, courseId, currentLesson } = createProgressDto;

    // Check if progress already exists
    const exists = await this.progressRepository.exists(studentId, courseId);
    if (exists) {
      throw new Error(
        `Progress already exists for student ${studentId} and course ${courseId}`,
      );
    }

    // Verify student and course exist
    await this.studentService.findOne(studentId);
    await this.courseService.findById(courseId);

    const progressData: Partial<Progress> = {
      studentId: createObjectId(studentId, 'studentId'),
      courseId: createObjectId(courseId, 'courseId'),
      completedLessons: {},
      completionPercentage: 0,
      timeSpent: {},
      coinsEarned: 0,
      lessonCode: {},
      startedAt: new Date(),
      isActive: true,
      lastCalculatedAt: new Date(),
    };

    if (currentLesson) {
      progressData.currentLesson = createObjectId(
        currentLesson,
        'currentLesson',
      );
    }

    // Create the progress record
    const progress = await this.progressRepository.create(progressData);

    // Add student to course's students array
    try {
      await this.courseService.addStudent(courseId, studentId);
      console.log(
        `✅ Student ${studentId} added to course ${courseId} students array`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to add student ${studentId} to course ${courseId}:`,
        error,
      );
      // Don't throw error to avoid breaking progress creation
    }

    return progress;
  }

  /**
   * Get progress by ID
   */
  async findById(id: string): Promise<ProgressDocument> {
    return this.progressRepository.findById(id);
  }

  /**
   * Get all progress
   */
  async findAll(): Promise<ProgressDocument[]> {
    return this.progressRepository.findAll();
  }

  /**
   * Get progress by student and course
   */
  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<ProgressDocument> {
    return this.progressRepository.findByStudentAndCourse(studentId, courseId);
  }

  /**
   * Get all progress for a student
   */
  async findByStudentId(studentId: string): Promise<ProgressDocument[]> {
    return this.progressRepository.findByStudentId(studentId);
  }

  /**
   * Get all progress for a course
   */
  async findByCourseId(courseId: string): Promise<ProgressDocument[]> {
    return this.progressRepository.findByCourseId(courseId);
  }

  /**
   * Update progress
   */
  async update(
    id: string,
    updateProgressDto: UpdateProgressDto,
  ): Promise<ProgressDocument> {
    const entity: any = {};

    if (updateProgressDto.completionPercentage !== undefined) {
      entity.completionPercentage = updateProgressDto.completionPercentage;
    }
    if (updateProgressDto.coinsEarned !== undefined) {
      entity.coinsEarned = updateProgressDto.coinsEarned;
    }
    if (updateProgressDto.isActive !== undefined) {
      entity.isActive = updateProgressDto.isActive;
    }
    if (updateProgressDto.studentId) {
      entity.studentId = createObjectId(
        updateProgressDto.studentId,
        'studentId',
      );
    }
    if (updateProgressDto.courseId) {
      entity.courseId = createObjectId(updateProgressDto.courseId, 'courseId');
    }
    if (updateProgressDto.currentLesson) {
      entity.currentLesson = createObjectId(
        updateProgressDto.currentLesson,
        'currentLesson',
      );
    }

    return this.progressRepository.findByIdAndUpdate(id, entity);
  }

  /**
   * Delete progress
   */
  async delete(id: string): Promise<void> {
    await this.progressRepository.findByIdAndDelete(id);
  }

  /**
   * Complete a lesson and update progress
   */
  async completeLesson(
    progressId: string,
    completeLessonDto: CompleteLessonDto,
  ): Promise<ProgressDocument> {
    const { lessonId, timeSpent = 0 } = completeLessonDto;
    const progress = await this.findById(progressId);

    // Verify lesson exists
    await this.lessonService.findById(lessonId);

    // Update completion status
    const completionData = {
      isCompleted: true,
      completedAt: new Date(),
      timeSpent,
    };

    await this.progressRepository.updateCompletedLessons(
      progressId,
      lessonId,
      completionData,
    );

    // Update student streak
    await this.studentService.updateCodingStreak(progress.studentId.toString());

    // Update total time spent
    await this.studentService.updateTotalTimeSpent(
      progress.studentId.toString(),
      timeSpent,
    );

    // Calculate and update completion percentage
    const updatedProgress =
      await this.calculateCompletionPercentage(progressId);

    // Calculate and award coins
    await this.calculateAndAwardCoins(progressId);

    return updatedProgress;
  }

  /**
   * Save lesson code
   */
  async saveCode(
    progressId: string,
    saveCodeDto: SaveCodeDto,
  ): Promise<ProgressDocument> {
    const { lessonId, language, code } = saveCodeDto;
    const progress = await this.findById(progressId);

    // Verify lesson exists
    await this.lessonService.findById(lessonId);

    const codeData = {
      language,
      code,
      timestamp: new Date(),
    };

    return this.progressRepository.updateLessonCode(
      progressId,
      lessonId,
      codeData,
    );
  }

  /**
   * Update time spent for current week
   */
  async updateTimeSpent(
    progressId: string,
    minutes: number,
  ): Promise<ProgressDocument> {
    const weekKey = this.getCurrentWeekKey();
    return this.progressRepository.updateTimeSpent(
      progressId,
      weekKey,
      minutes,
    );
  }

  /**
   * Calculate completion percentage dynamically
   */
  async calculateCompletionPercentage(
    progressId: string,
  ): Promise<ProgressDocument> {
    const progress = await this.findById(progressId);
    const course = await this.courseService.findById(
      progress.courseId.toString(),
    );

    const totalLessons = course.lessons.length;
    const completedLessons = Object.values(progress.completedLessons).filter(
      (lesson: any) => lesson.isCompleted,
    ).length;

    const percentage =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return this.progressRepository.findByIdAndUpdate(progressId, {
      completionPercentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      lastCalculatedAt: new Date(),
    });
  }

  /**
   * Get completion percentage for student-course pair
   */
  async getCompletionPercentage(
    studentId: string,
    courseId: string,
  ): Promise<{
    percentage: number;
    completedLessons: number;
    totalLessons: number;
  }> {
    const progress = await this.findByStudentAndCourse(studentId, courseId);
    const course = await this.courseService.findById(courseId);

    const totalLessons = course.lessons.length;
    const completedLessons = Object.values(progress.completedLessons).filter(
      (lesson: any) => lesson.isCompleted,
    ).length;

    const percentage =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      percentage: Math.round(percentage * 100) / 100,
      completedLessons,
      totalLessons,
    };
  }

  /**
   * Calculate and award coins based on progress
   */
  private async calculateAndAwardCoins(progressId: string): Promise<void> {
    const progress = await this.findById(progressId);
    const course = await this.courseService.findById(
      progress.courseId.toString(),
    );

    const totalLessons = course.lessons.length;
    const completedLessons = Object.values(progress.completedLessons).filter(
      (lesson: any) => lesson.isCompleted,
    ).length;

    // Base coins per lesson (10 coins)
    const baseCoins = completedLessons * 10;

    // Streak bonus (5 coins per day in streak)
    const student = await this.studentService.findOne(
      progress.studentId.toString(),
    );
    const streakBonus = student.codingStreak * 5;

    // Completion bonus (50 coins for course completion)
    const completionBonus = completedLessons === totalLessons ? 50 : 0;

    // Weekly activity bonus (25 coins for 5+ hours/week)
    const currentWeekKey = this.getCurrentWeekKey();
    const weeklyTime = progress.timeSpent[currentWeekKey] || 0;
    const weeklyBonus = weeklyTime >= 300 ? 25 : 0; // 300 minutes = 5 hours

    const totalCoins = baseCoins + streakBonus + completionBonus + weeklyBonus;
    const coinsToAward = totalCoins - (progress.coinsEarned || 0);

    if (coinsToAward > 0) {
      await this.progressRepository.findByIdAndUpdate(progressId, {
        coinsEarned: totalCoins,
      });
      await this.studentService.addCoinsAndUpdateTotal(
        progress.studentId.toString(),
        coinsToAward,
      );
    }
  }

  /**
   * Get current week key in ISO format (e.g., "2024-W01")
   */
  private getCurrentWeekKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  /**
   * Update progress for all students when new lessons are added to a course
   */
  async updateProgressForNewLessons(courseId: string): Promise<void> {
    const allProgress = await this.findByCourseId(courseId);

    for (const progress of allProgress) {
      await this.calculateCompletionPercentage(
        (progress as any)._id.toString(),
      );
    }
  }
}
