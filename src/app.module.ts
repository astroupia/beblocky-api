import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CourseModule } from './course/course.module';
import { UserModule } from './user/user.module';
import { StudentModule } from './student/student.module';
import { OrganizationModule } from './organization/organization.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { LessonModule } from './lesson/lesson.module';
import { SlideModule } from './slide/slide.module';
import { ParentModule } from './parent/parent.module';
import { AdminModule } from './admin/admin.module';
import { TeacherModule } from './teacher/teacher.module';
import { PaymentModule } from './payment/payment.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProgressModule } from './progress/progress.module';
import { ClassModule } from './class/class.module';
import { CertificateModule } from './certificate/certificate.module';
import { CloudinaryController } from './cloudinary/controllers/cloudinary.controller';
import { CloudinaryService } from './cloudinary/services/cloudinary.service';
import { StripeModule } from './stripe/stripe.module';
import { ListenersModule } from './infrastructure/database/database.module';
import { AiConversationModule } from './ai-conversation/ai-conversation.module';
import { CodeAnalysisModule } from './code-analysis/code-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      // Global event emitter configuration
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    CourseModule,
    UserModule,
    StudentModule,
    OrganizationModule,
    SubscriptionModule,
    LessonModule,
    SlideModule,
    ParentModule,
    AdminModule,
    TeacherModule,
    PaymentModule,
    CloudinaryModule,
    StripeModule,
    ProgressModule,
    ClassModule,
    CertificateModule,
    ListenersModule,
    AiConversationModule,
    CodeAnalysisModule,
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
})
export class AppModule {}
