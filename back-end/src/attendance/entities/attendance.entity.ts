import { ApiProperty } from '@nestjs/swagger';

export class Attendance {
  @ApiProperty() id: string;
  @ApiProperty() registrationId: string;
  @ApiProperty() status: string;
  @ApiProperty({ nullable: true }) attendanceTime: string | null;
}
