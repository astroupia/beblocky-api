import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificateController } from './controllers/certificate.controller';
import { CertificateService } from './services/certificate.service';
import { CertificateRepository } from './repositories/certificate.repository';
import { CertificateSchema } from './entities/certificate.entity';
import { StudentModule } from '../student/student.module';
import { CourseModule } from '../course/course.module';
import { ProgressModule } from '../progress/progress.module';
import { OrganizationModule } from '../organization/organization.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Certificate', schema: CertificateSchema },
    ]),
    forwardRef(() => StudentModule),
    forwardRef(() => CourseModule),
    forwardRef(() => ProgressModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => CloudinaryModule),
  ],
  controllers: [CertificateController],
  providers: [CertificateService, CertificateRepository],
  exports: [CertificateService, CertificateRepository],
})
export class CertificateModule {}
