import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
