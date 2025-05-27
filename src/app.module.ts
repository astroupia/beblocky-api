import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import { SlideModule } from './slide/slide.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/beblocky'),
    CourseModule,
    LessonModule,
    SlideModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
