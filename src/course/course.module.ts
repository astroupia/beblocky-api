import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { CourseRepository } from './repositories/course.repository';
import { CourseSchema } from './entities/course.entity';
import { LessonModule } from '../lesson/lesson.module';
import { SlideModule } from '../slide/slide.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }]),
    forwardRef(() => LessonModule),
    forwardRef(() => SlideModule),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseService],
})
export class CourseModule {}
