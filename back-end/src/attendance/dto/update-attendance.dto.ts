import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiProperty({ example: 'PRESENT', enum: ['PENDING', 'PRESENT', 'ABSENT'] })
  @IsOptional() @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  attendanceTime?: string;
}
