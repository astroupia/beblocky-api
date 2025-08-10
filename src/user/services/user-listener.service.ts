import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UserRole } from '../entities/user.entity';
import { User } from '../entities/user.entity';
import { TeacherService } from '../../teacher/services/teacher.service';
import { AdminService } from '../../admin/services/admin.service';
import { StudentService } from '../../student/services/student.service';
import { ParentService } from '../../parent/services/parent.service';
import { OrganizationService } from '../../organization/services/organization.service';

@Injectable()
export class UserListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UserListenerService.name);
  private changeStream: any;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly teacherService: TeacherService,
    private readonly adminService: AdminService,
    private readonly studentService: StudentService,
    private readonly parentService: ParentService,
    private readonly organizationService: OrganizationService,
  ) {}

  onModuleInit() {
    this.logger.log(
      'Initializing user listener with MongoDB change streams...',
    );
    this.startListening();
  }

  async onModuleDestroy() {
    this.logger.log('Stopping user listener...');
    if (this.changeStream) {
      await this.changeStream.close();
    }
  }

  private startListening() {
    try {
      const db = this.connection.db;

      // Check if database connection is available
      if (!db) {
        this.logger.error('Database connection is not available');
        return;
      }

      const collection = db.collection('users');

      // Listen for insert operations on the users collection
      this.changeStream = collection.watch([
        {
          $match: {
            operationType: 'insert',
          },
        },
      ]);

      this.changeStream.on('change', async (change: any) => {
        this.logger.log(`New user detected: ${change.documentKey._id}`);

        try {
          const user = change.fullDocument as User;
          await this.handleUserCreated(user);
        } catch (error) {
          this.logger.error(
            `Error processing new user ${change.documentKey._id}:`,
            error,
          );
        }
      });

      this.changeStream.on('error', (error: any) => {
        this.logger.error('Change stream error:', error);
      });

      this.logger.log('User listener started successfully');
    } catch (error) {
      this.logger.error('Failed to start user listener:', error);
    }
  }

  private async handleUserCreated(user: User) {
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
      // You might want to emit an event or handle this error differently
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
