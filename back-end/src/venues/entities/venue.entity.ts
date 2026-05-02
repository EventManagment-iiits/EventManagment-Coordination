import { ApiProperty } from '@nestjs/swagger';

export class Venue {
  @ApiProperty() id: string;
  @ApiProperty() venueName: string;
  @ApiProperty() location: string;
  @ApiProperty() capacity: number;
  @ApiProperty() status: string;
}
