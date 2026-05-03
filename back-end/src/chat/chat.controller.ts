import { Controller, Get, Post, Body, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Get all messages for an event' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @Roles(Role.ORGANIZER, Role.STAFF, Role.SUPER_USER)
  findAll(@Query('eventId') eventId: string) {
    return this.chatService.findAll(eventId);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a message' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiHeader({ name: 'x-user-id', required: true })
  @Roles(Role.ORGANIZER, Role.STAFF)
  create(
    @Headers('x-user-id') userId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.create(userId, sendMessageDto);
  }
}
