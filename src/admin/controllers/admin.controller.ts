import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto } from '../dtos/create-admin.dto';
import { CreateAdminFromUserDto } from '../dtos/create-admin-from-user.dto';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { AdminDocument } from '../entities/admin.entity';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto): Promise<AdminDocument> {
    return this.adminService.create(createAdminDto);
  }

  @Post('from-user')
  createFromUser(
    @Body() createAdminFromUserDto: CreateAdminFromUserDto,
  ): Promise<AdminDocument> {
    return this.adminService.createFromUser(createAdminFromUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdminDocument> {
    return this.adminService.findById(id);
  }

  @Get()
  findAll(): Promise<AdminDocument[]> {
    return this.adminService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<AdminDocument> {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.adminService.delete(id);
  }

  @Get('access-level/:level')
  findByAccessLevel(@Param('level') level: string): Promise<AdminDocument[]> {
    return this.adminService.findByAccessLevel(level);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string): Promise<AdminDocument> {
    return this.adminService.findByUserId(userId);
  }
}
