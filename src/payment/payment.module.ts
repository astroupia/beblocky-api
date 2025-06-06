import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { Mongoose } from 'mongoose';
import { LessonSchema, LessonSchemaClass } from 'src/lesson/entities/lesson.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './entities/payment.entity';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }])],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentRepository],
})
export class PaymentModule {}
