import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ParentService } from '../services/parent.service';
import { CreateParentDto } from '../dtos/create-parent.dto';
import { CreateParentFromUserDto } from '../dtos/create-parent-from-user.dto';
import { UpdateParentDto } from '../dtos/update-parent.dto';
import { AddChildDto } from '../dtos/add-child.dto';
import { ParentDocument } from '../entities/parent.entity';

@Controller('parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  create(@Body() createParentDto: CreateParentDto): Promise<ParentDocument> {
    return this.parentService.create(createParentDto);
  }

  @Post('from-user')
  createFromUser(
    @Body() createParentFromUserDto: CreateParentFromUserDto,
  ): Promise<ParentDocument> {
    return this.parentService.createFromUser(createParentFromUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ParentDocument> {
    return this.parentService.findById(id);
  }

  @Get()
  findAll(): Promise<ParentDocument[]> {
    return this.parentService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParentDto: UpdateParentDto,
  ): Promise<ParentDocument> {
    return this.parentService.update(id, updateParentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.parentService.delete(id);
  }

  @Get('phone/:phoneNumber')
  findByPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<ParentDocument> {
    return this.parentService.findByPhoneNumber(phoneNumber);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string): Promise<ParentDocument> {
    return this.parentService.findByUserId(userId);
  }

  // New endpoints for children management
  @Get(':parentId/children')
  getChildren(@Param('parentId') parentId: string) {
    return this.parentService.getChildren(parentId);
  }

  @Get(':parentId/with-children')
  getParentWithChildren(@Param('parentId') parentId: string) {
    return this.parentService.getParentWithChildren(parentId);
  }

  @Post(':parentId/children')
  addChild(
    @Param('parentId') parentId: string,
    @Body() addChildDto: AddChildDto,
  ) {
    return this.parentService.addChild(parentId, addChildDto);
  }
}
