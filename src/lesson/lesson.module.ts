import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonController } from './controllers/lesson.controller';
import { LessonService } from './services/lesson.service';
import { LessonRepository } from './repositories/lesson.repository';
import { LessonSchema } from './entities/lesson.entity';
import { CourseModule } from '../course/course.module';
import { SlideModule } from '../slide/slide.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Lesson', schema: LessonSchema }]),
    forwardRef(() => CourseModule),
    forwardRef(() => SlideModule),
  ],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository],
  exports: [LessonService],
})
export class LessonModule {}
