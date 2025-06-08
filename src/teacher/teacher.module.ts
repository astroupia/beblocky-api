import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherService } from './services/teacher.service';
import { TeacherController } from './controllers/teacher.controller';
import { TeacherSchema } from './entities/teacher.entity';
import { TeacherRepository } from './repositories/teacher.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Teacher', schema: TeacherSchema }]),
    UserModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository],
  exports: [TeacherService],
})
export class TeacherModule {}
