import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeAnalysisController } from './controllers/code-analysis.controller';
import { CodeAnalysisService } from './services/code-analysis.service';
import { CodeAnalysisRepository } from './repositories/code-analysis.repository';
import { CodeAnalysisSchema } from './entities/code-analysis.entity';

// Import other modules that this module depends on
import { ProgressModule } from '../progress/progress.module';
import { CourseModule } from '../course/course.module';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CodeAnalysis', schema: CodeAnalysisSchema },
    ]),
    forwardRef(() => ProgressModule),
    forwardRef(() => CourseModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [CodeAnalysisController],
  providers: [CodeAnalysisService, CodeAnalysisRepository],
  exports: [CodeAnalysisService],
})
export class CodeAnalysisModule {}
