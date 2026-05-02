import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  password: string; // not exposed in swagger responses
  @ApiProperty() role: string;
  @ApiProperty() status: string;
  @ApiProperty() orgDept: string;
  @ApiProperty() createdAt: string;
}
