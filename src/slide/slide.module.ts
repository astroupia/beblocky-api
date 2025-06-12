import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SlideController } from './controllers/slide.controller';
import { SlideService } from './services/slide.service';
import { SlideRepository } from './repositories/slide.repository';
import { SlideSchema } from './entities/slide.entity';
import { CourseModule } from '../course/course.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Slide', schema: SlideSchema }]),
    forwardRef(() => CourseModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [SlideController],
  providers: [SlideService, SlideRepository],
  exports: [SlideService],
})
export class SlideModule {}
