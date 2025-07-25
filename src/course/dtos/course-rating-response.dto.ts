import {
  RatingValue,
  ICourseRatingResponse,
  ICourseRatingStats,
} from '../../types';

export class CourseRatingResponseDto implements ICourseRatingResponse {
  id: string;
  courseId: string;
  userId: string;
  rating: RatingValue;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CourseRatingStatsDto implements ICourseRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number;
  };
  userRating?: RatingValue;
  userReview?: string;
}
