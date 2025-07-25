import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseRating,
  CourseRatingDocument,
} from '../entities/course-rating.entity';
import { createObjectId } from '../../utils/object-id.utils';
import { ICourseRating } from '../../types';

@Injectable()
export class CourseRatingRepository {
  constructor(
    @InjectModel('CourseRating')
    private readonly courseRatingModel: Model<CourseRatingDocument>,
  ) {}

  async create(data: {
    courseId: string;
    userId: string;
    rating: number;
    review?: string;
  }): Promise<CourseRatingDocument> {
    const courseRating = new this.courseRatingModel({
      courseId: createObjectId(data.courseId, 'courseId'),
      userId: createObjectId(data.userId, 'userId'),
      rating: data.rating,
      review: data.review,
    });
    return await courseRating.save();
  }

  async findById(id: string): Promise<CourseRatingDocument> {
    const courseRating = await this.courseRatingModel.findById(id).exec();
    if (!courseRating) {
      throw new NotFoundException(`Course rating with ID ${id} not found`);
    }
    return courseRating;
  }

  async findByCourseAndUser(
    courseId: string,
    userId: string,
  ): Promise<CourseRatingDocument | null> {
    return this.courseRatingModel
      .findOne({
        courseId: createObjectId(courseId, 'courseId'),
        userId: createObjectId(userId, 'userId'),
      })
      .exec();
  }

  async findByCourseId(courseId: string): Promise<CourseRatingDocument[]> {
    return this.courseRatingModel
      .find({ courseId: createObjectId(courseId, 'courseId') })
      .populate('userId', 'firstName lastName')
      .exec();
  }

  async findByUserId(userId: string): Promise<CourseRatingDocument[]> {
    return this.courseRatingModel
      .find({ userId: createObjectId(userId, 'userId') })
      .populate('courseId', 'courseTitle')
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<CourseRating>,
  ): Promise<CourseRatingDocument> {
    const courseRating = await this.courseRatingModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!courseRating) {
      throw new NotFoundException(`Course rating with ID ${id} not found`);
    }
    return courseRating;
  }

  async findByIdAndDelete(id: string): Promise<CourseRatingDocument> {
    const courseRating = await this.courseRatingModel
      .findByIdAndDelete(id)
      .exec();
    if (!courseRating) {
      throw new NotFoundException(`Course rating with ID ${id} not found`);
    }
    return courseRating;
  }

  async getCourseRatingStats(courseId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const stats = await this.courseRatingModel.aggregate([
      {
        $match: { courseId: createObjectId(courseId, 'courseId') },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const stat = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    stat.ratingDistribution.forEach((rating: number) => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return {
      averageRating: Math.round(stat.averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings: stat.totalRatings,
      ratingDistribution: distribution,
    };
  }

  async getUserRatingForCourse(
    courseId: string,
    userId: string,
  ): Promise<CourseRatingDocument | null> {
    return this.courseRatingModel
      .findOne({
        courseId: createObjectId(courseId, 'courseId'),
        userId: createObjectId(userId, 'userId'),
      })
      .exec();
  }
}
