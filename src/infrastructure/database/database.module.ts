import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserListenerService } from '../../user/services/user-listener.service';
import { UserModule } from '../../user/user.module';
import { TeacherModule } from '../../teacher/teacher.module';
import { AdminModule } from '../../admin/admin.module';
import { StudentModule } from '../../student/student.module';
import { ParentModule } from '../../parent/parent.module';
import { OrganizationModule } from '../../organization/organization.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => TeacherModule),
    forwardRef(() => AdminModule),
    forwardRef(() => StudentModule),
    forwardRef(() => ParentModule),
    forwardRef(() => OrganizationModule),
  ],
  providers: [UserListenerService],
})
export class ListenersModule {}
