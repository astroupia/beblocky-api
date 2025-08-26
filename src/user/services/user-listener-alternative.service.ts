import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRole } from '../entities/user.entity';
import { User } from '../entities/user.entity';
import { TeacherService } from '../../teacher/services/teacher.service';
import { AdminService } from '../../admin/services/admin.service';
import { StudentService } from '../../student/services/student.service';
import { ParentService } from '../../parent/services/parent.service';
import { OrganizationService } from '../../organization/services/organization.service';

@Injectable()
export class UserListenerAlternativeService implements OnModuleInit {
  private readonly logger = new Logger(UserListenerAlternativeService.name);

  constructor(
    private readonly teacherService: TeacherService,
    private readonly adminService: AdminService,
    private readonly studentService: StudentService,
    private readonly parentService: ParentService,
    private readonly organizationService: OrganizationService,
  ) {}

  onModuleInit() {
    this.logger.log(
      'Initializing alternative user listener with event emitters...',
    );
  }

  @OnEvent('user.created')
  async handleUserCreated(user: User) {
    this.logger.log(
      `Processing new user creation for user: ${user._id} with role: ${user.role}`,
    );

    try {
      switch (user.role) {
        case UserRole.TEACHER:
          await this.createTeacherInstance(user);
          break;
        case UserRole.ADMIN:
          await this.createAdminInstance(user);
          break;
        case UserRole.STUDENT:
          await this.createStudentInstance(user);
          break;
        case UserRole.PARENT:
          await this.createParentInstance(user);
          break;
        case UserRole.ORGANIZATION:
          await this.createOrganizationInstance(user);
          break;
        default:
          this.logger.warn(
            `Unknown user role: ${user.role} for user: ${user._id}`,
          );
      }
    } catch (error) {
      this.logger.error(
        `Failed to create role-specific instance for user ${user._id}:`,
        error,
      );
      throw error;
    }
  }

  private async createTeacherInstance(user: User) {
    this.logger.log(`Creating teacher instance for user: ${user._id}`);
    await this.teacherService.createFromUser({
      userId: user._id,
    });
    this.logger.log(
      `Teacher instance created successfully for user: ${user._id}`,
    );
  }

  private async createAdminInstance(user: User) {
    this.logger.log(`Creating admin instance for user: ${user._id}`);
    await this.adminService.createFromUser({
      userId: user._id,
    });
    this.logger.log(
      `Admin instance created successfully for user: ${user._id}`,
    );
  }

  private async createStudentInstance(user: User) {
    this.logger.log(`Creating student instance for user: ${user._id}`);
    await this.studentService.createFromUser({
      userId: user._id,
    });
    this.logger.log(
      `Student instance created successfully for user: ${user._id}`,
    );
  }

  private async createParentInstance(user: User) {
    this.logger.log(`Creating parent instance for user: ${user._id}`);
    await this.parentService.createFromUser({
      userId: user._id,
    });
    this.logger.log(
      `Parent instance created successfully for user: ${user._id}`,
    );
  }

  private async createOrganizationInstance(user: User) {
    this.logger.log(`Creating organization instance for user: ${user._id}`);
    await this.organizationService.createFromUser({
      userId: user._id,
    });
    this.logger.log(
      `Organization instance created successfully for user: ${user._id}`,
    );
  }
}
