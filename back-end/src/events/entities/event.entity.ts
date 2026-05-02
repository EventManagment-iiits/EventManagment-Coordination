import { ApiProperty } from '@nestjs/swagger';

export class Event {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() imageUrl: string;
  @ApiProperty() eventDate: string;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;
  @ApiProperty() capacity: number;
  @ApiProperty() organizerId: string;
  @ApiProperty() venueId: string;
}
