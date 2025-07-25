import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRatingRepository } from '../repositories/course-rating.repository';
import { CourseRepository } from '../repositories/course.repository';
import { CourseRatingDocument } from '../entities/course-rating.entity';
import { CreateCourseRatingDto } from '../dtos/create-course-rating.dto';
import { UpdateCourseRatingDto } from '../dtos/update-course-rating.dto';
import { CourseRatingStatsDto } from '../dtos/course-rating-response.dto';
import { ICourseRating, ICourseRatingStats } from '../../types';

@Injectable()
export class CourseRatingService {
  constructor(
    private readonly courseRatingRepository: CourseRatingRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  /**
   * Rate a course
   */
  async rateCourse(
    courseId: string,
    userId: string,
    createRatingDto: CreateCourseRatingDto,
  ): Promise<CourseRatingDocument> {
    // Verify course exists
    await this.courseRepository.findById(courseId);

    // Check if user already rated this course
    const existingRating =
      await this.courseRatingRepository.findByCourseAndUser(courseId, userId);

    if (existingRating) {
      throw new BadRequestException('User has already rated this course');
    }

    // Create the rating
    const rating = await this.courseRatingRepository.create({
      courseId,
      userId,
      rating: createRatingDto.rating,
      review: createRatingDto.review,
    });

    // Update course average rating
    await this.updateCourseAverageRating(courseId);

    return rating;
  }

  /**
   * Update a course rating
   */
  async updateRating(
    courseId: string,
    userId: string,
    updateRatingDto: UpdateCourseRatingDto,
  ): Promise<CourseRatingDocument> {
    // Find existing rating
    const existingRating =
      await this.courseRatingRepository.findByCourseAndUser(courseId, userId);

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    // Update the rating
    const updatedRating = await this.courseRatingRepository.findByIdAndUpdate(
      (existingRating._id as any).toString(),
      updateRatingDto,
    );

    // Update course average rating
    await this.updateCourseAverageRating(courseId);

    return updatedRating;
  }

  /**
   * Delete a course rating
   */
  async deleteRating(courseId: string, userId: string): Promise<void> {
    const existingRating =
      await this.courseRatingRepository.findByCourseAndUser(courseId, userId);

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    await this.courseRatingRepository.findByIdAndDelete(
      (existingRating._id as any).toString(),
    );

    // Update course average rating
    await this.updateCourseAverageRating(courseId);
  }

  /**
   * Get rating statistics for a course
   */
  async getCourseRatingStats(
    courseId: string,
    userId?: string,
  ): Promise<CourseRatingStatsDto> {
    // Verify course exists
    await this.courseRepository.findById(courseId);

    // Get overall stats
    const stats =
      await this.courseRatingRepository.getCourseRatingStats(courseId);

    // Get user's rating if userId is provided
    let userRating: number | undefined;
    let userReview: string | undefined;

    if (userId) {
      const userRatingDoc =
        await this.courseRatingRepository.getUserRatingForCourse(
          courseId,
          userId,
        );
      if (userRatingDoc) {
        userRating = userRatingDoc.rating;
        userReview = userRatingDoc.review;
      }
    }

    return {
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      ratingDistribution: stats.ratingDistribution,
      userRating,
      userReview,
    };
  }

  /**
   * Get all ratings for a course
   */
  async getCourseRatings(courseId: string): Promise<CourseRatingDocument[]> {
    // Verify course exists
    await this.courseRepository.findById(courseId);

    return this.courseRatingRepository.findByCourseId(courseId);
  }

  /**
   * Get all ratings by a user
   */
  async getUserRatings(userId: string): Promise<CourseRatingDocument[]> {
    return this.courseRatingRepository.findByUserId(userId);
  }

  /**
   * Get a specific rating
   */
  async getRating(ratingId: string): Promise<CourseRatingDocument> {
    return this.courseRatingRepository.findById(ratingId);
  }

  /**
   * Update course average rating
   */
  private async updateCourseAverageRating(courseId: string): Promise<void> {
    const stats =
      await this.courseRatingRepository.getCourseRatingStats(courseId);

    await this.courseRepository.update(courseId, {
      rating: stats.averageRating,
    });
  }
}
