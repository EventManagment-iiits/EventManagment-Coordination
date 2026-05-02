import { ApiProperty } from '@nestjs/swagger';

export class Registration {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() eventId: string;
  @ApiProperty() status: string;
  @ApiProperty() registrationDate: string;
}
