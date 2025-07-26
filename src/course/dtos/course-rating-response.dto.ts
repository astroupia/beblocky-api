import { ICourseRatingResponse, ICourseRatingStats } from '../../types';

export class CourseRatingResponseDto implements ICourseRatingResponse {
  id: string;
  courseId: string;
  userId: string;
  rating: number; // Use number instead of RatingValue enum
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
  userRating?: number; // Use number instead of RatingValue enum
  userReview?: string;
}
