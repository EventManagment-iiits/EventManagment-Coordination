import { ApiProperty } from '@nestjs/swagger';

export class ChatMessage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  senderName: string;

  @ApiProperty()
  senderRole: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  timestamp: string;
}
