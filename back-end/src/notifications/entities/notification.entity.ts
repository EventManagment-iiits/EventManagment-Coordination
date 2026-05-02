import { ApiProperty } from '@nestjs/swagger';

export class Notification {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() title: string;
  @ApiProperty() message: string;
  @ApiProperty() type: string;
  @ApiProperty() createdAt: string;
}
