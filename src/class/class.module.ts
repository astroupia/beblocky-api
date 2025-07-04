import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassController } from './controllers/class.controller';
import { OrganizationApplicationController } from './controllers/organization-application.controller';
import { ClassService } from './services/class.service';
import { OrganizationApplicationService } from './services/organization-application.service';
import { ClassRepository } from './repositories/class.repository';
import { OrganizationApplicationRepository } from './repositories/organization-application.repository';
import { ClassSchema } from './entities/class.entity';
import { OrganizationApplicationSchema } from './entities/organization-application.entity';
import { StudentModule } from '../student/student.module';
import { CourseModule } from '../course/course.module';
import { OrganizationModule } from '../organization/organization.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Class', schema: ClassSchema },
      {
        name: 'OrganizationApplication',
        schema: OrganizationApplicationSchema,
      },
    ]),
    forwardRef(() => StudentModule),
    forwardRef(() => CourseModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => ProgressModule),
  ],
  controllers: [ClassController, OrganizationApplicationController],
  providers: [
    ClassService,
    OrganizationApplicationService,
    ClassRepository,
    OrganizationApplicationRepository,
  ],
  exports: [ClassService, OrganizationApplicationService],
})
export class ClassModule {}
