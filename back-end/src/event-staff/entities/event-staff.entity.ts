import { ApiProperty } from '@nestjs/swagger';

export class EventStaff {
  @ApiProperty() id: string;
  @ApiProperty() eventId: string;
  @ApiProperty() staffId: string;
  @ApiProperty() role: string;
  @ApiProperty() shiftStart: string;
  @ApiProperty() shiftEnd: string;
  @ApiProperty() status: string;
}
