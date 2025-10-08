import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiConversationController } from './controllers/ai-conversation.controller';
import { AiConversationService } from './services/ai-conversation.service';
import { AiConversationRepository } from './repositories/ai-conversation.repository';
import { AiConversationSchema } from './entities/ai-conversation.entity';

// Import other modules that this module depends on
import { CourseModule } from '../course/course.module';
import { LessonModule } from '../lesson/lesson.module';
import { SlideModule } from '../slide/slide.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AiConversation', schema: AiConversationSchema },
    ]),
    forwardRef(() => CourseModule),
    forwardRef(() => LessonModule),
    forwardRef(() => SlideModule),
    forwardRef(() => ProgressModule),
  ],
  controllers: [AiConversationController],
  providers: [AiConversationService, AiConversationRepository],
  exports: [AiConversationService],
})
export class AiConversationModule {}
