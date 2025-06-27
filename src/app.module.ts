import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { CloudinaryController } from './cloudinary/controllers/cloudinary.controller';
import { CloudinaryService } from './cloudinary/services/cloudinary.service';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    StudentModule,
    SubscriptionModule,
    LessonModule,
    SlideModule,
    ParentModule,
    AdminModule,
    TeacherModule,
    PaymentModule,
    CloudinaryModule,
    StripeModule,
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
})
export class AppModule {}
