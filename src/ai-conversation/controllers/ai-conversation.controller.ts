import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AiConversationService } from '../services/ai-conversation.service';
import { CreateAiConversationDto } from '../dtos/create-ai-conversation.dto';
import { SendMessageDto } from '../dtos/send-message.dto';

@Controller('ai-conversations')
export class AiConversationController {
  constructor(private readonly aiConversationService: AiConversationService) {}

  @Post()
  create(@Body() createDto: CreateAiConversationDto) {
    return this.aiConversationService.create(createDto);
  }

  @Post(':id/messages')
  sendMessage(@Param('id') id: string, @Body() sendMessageDto: SendMessageDto) {
    return this.aiConversationService.sendMessage(id, sendMessageDto);
  }

  @Get()
  findAll() {
    return this.aiConversationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiConversationService.findById(id);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.aiConversationService.findByStudentId(studentId);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.aiConversationService.findByCourseId(courseId);
  }

  @Get(':studentId/:courseId')
  findByStudentAndCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.aiConversationService.findByStudentAndCourse(
      studentId,
      courseId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiConversationService.delete(id);
  }
}
