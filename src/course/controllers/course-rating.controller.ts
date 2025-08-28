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
import { CourseRatingService } from '../services/course-rating.service';
import { CreateCourseRatingDto } from '../dtos/create-course-rating.dto';
import { UpdateCourseRatingDto } from '../dtos/update-course-rating.dto';
import {
  CourseRatingResponseDto,
  CourseRatingStatsDto,
} from '../dtos/course-rating-response.dto';
import { CourseRatingDocument } from '../entities/course-rating.entity';
import { ICourseRatingResponse, ICourseRatingStats } from '../../types';

// Helper function to convert rating document to response DTO
function mapRatingToResponse(
  rating: CourseRatingDocument,
): CourseRatingResponseDto {
  return {
    id: (rating._id as any).toString(),
    courseId: rating.courseId.toString(),
    userId: rating.userId ? rating.userId.toString() : '', // Ensure userId is always a string
    rating: rating.rating,
    review: rating.review,
    createdAt: (rating as any).createdAt,
    updatedAt: (rating as any).updatedAt,
  };
}

@Controller('courses/:courseId/ratings')
export class CourseRatingController {
  constructor(private readonly courseRatingService: CourseRatingService) {}

  @Post()
  async rateCourse(
    @Param('courseId') courseId: string,
    @Body() createRatingDto: CreateCourseRatingDto,
    @Query('userId') userId: string,
  ): Promise<CourseRatingResponseDto> {
    const rating = await this.courseRatingService.rateCourse(
      courseId,
      userId,
      createRatingDto,
    );

    return mapRatingToResponse(rating);
  }

  @Get('stats')
  async getRatingStats(
    @Param('courseId') courseId: string,
    @Query('userId') userId?: string,
  ): Promise<CourseRatingStatsDto> {
    return this.courseRatingService.getCourseRatingStats(courseId, userId);
  }

  @Get()
  async getCourseRatings(
    @Param('courseId') courseId: string,
  ): Promise<CourseRatingResponseDto[]> {
    const ratings = await this.courseRatingService.getCourseRatings(courseId);
    return ratings.map(mapRatingToResponse);
  }

  @Patch()
  async updateRating(
    @Param('courseId') courseId: string,
    @Body() updateRatingDto: UpdateCourseRatingDto,
    @Query('userId') userId: string,
  ): Promise<CourseRatingResponseDto> {
    const rating = await this.courseRatingService.updateRating(
      courseId,
      userId,
      updateRatingDto,
    );

    return mapRatingToResponse(rating);
  }

  @Delete()
  async deleteRating(
    @Param('courseId') courseId: string,
    @Query('userId') userId: string,
  ): Promise<{ message: string }> {
    await this.courseRatingService.deleteRating(courseId, userId);
    return { message: 'Rating deleted successfully' };
  }
}

@Controller('users/:userId/ratings')
export class UserRatingController {
  constructor(private readonly courseRatingService: CourseRatingService) {}

  @Get()
  async getUserRatings(
    @Param('userId') userId: string,
  ): Promise<CourseRatingResponseDto[]> {
    const ratings = await this.courseRatingService.getUserRatings(userId);
    return ratings.map(mapRatingToResponse);
  }
}
