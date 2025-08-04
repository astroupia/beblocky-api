import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './controllers/progress.controller';
import { ProgressService } from './services/progress.service';
import { ProgressRepository } from './repositories/progress.repository';
import { ProgressSchema } from './entities/progress.entity';
import { StudentModule } from '../student/student.module';
import { CourseModule } from '../course/course.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Progress', schema: ProgressSchema }]),
    forwardRef(() => StudentModule),
    forwardRef(() => CourseModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository],
  exports: [ProgressService],
})
export class ProgressModule {}
