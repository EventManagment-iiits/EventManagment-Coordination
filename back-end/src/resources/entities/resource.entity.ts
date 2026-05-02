import { ApiProperty } from '@nestjs/swagger';

export class Resource {
  @ApiProperty() id: string;
  @ApiProperty() resourceName: string;
  @ApiProperty() quantity: number;
}
