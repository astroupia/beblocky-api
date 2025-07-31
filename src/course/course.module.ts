import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './controllers/course.controller';
import {
  CourseRatingController,
  UserRatingController,
} from './controllers/course-rating.controller';
import { CourseService } from './services/course.service';
import { CourseRatingService } from './services/course-rating.service';
import { CourseRepository } from './repositories/course.repository';
import { CourseRatingRepository } from './repositories/course-rating.repository';
import { CourseSchema } from './entities/course.entity';
import { CourseRatingSchema } from './entities/course-rating.entity';
import { LessonModule } from '../lesson/lesson.module';
import { SlideModule } from '../slide/slide.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Course', schema: CourseSchema },
      { name: 'CourseRating', schema: CourseRatingSchema },
    ]),
    forwardRef(() => LessonModule),
    forwardRef(() => SlideModule),
    CloudinaryModule,
  ],
  controllers: [CourseController, CourseRatingController, UserRatingController],
  providers: [
    CourseService,
    CourseRatingService,
    CourseRepository,
    CourseRatingRepository,
  ],
  exports: [CourseService, CourseRatingService],
})
export class CourseModule {}
