import { ApiProperty } from '@nestjs/swagger';

export class EventResource {
  @ApiProperty() id: string;
  @ApiProperty() eventId: string;
  @ApiProperty() resourceId: string;
  @ApiProperty() quantityUsed: number;
}
