import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessage } from './entities/chat-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  private messages: ChatMessage[] = [];

  constructor(private usersService: UsersService) {}

  private genId(): string {
    return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(eventId?: string): ChatMessage[] {
    if (eventId) {
      return this.messages.filter((m) => m.eventId === eventId);
    }
    return this.messages;
  }

  create(userId: string, dto: SendMessageDto): ChatMessage {
    const user = this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const message: ChatMessage = {
      id: this.genId(),
      eventId: dto.eventId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: dto.content,
      timestamp: new Date().toISOString(),
    };

    this.messages.push(message);
    return message;
  }
}
