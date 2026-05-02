import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateEventStaffDto {
  @ApiProperty({ example: 'e1' })
  @IsString() @IsNotEmpty()
  eventId: string;

  @ApiProperty({ example: 'u5' })
  @IsString() @IsNotEmpty()
  staffId: string;

  @ApiProperty({ example: 'Main Stage Setup' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  role: string;

  @ApiProperty({ example: '09:00' })
  @IsString() @IsNotEmpty()
  shiftStart: string;

  @ApiProperty({ example: '12:00' })
  @IsString() @IsNotEmpty()
  shiftEnd: string;

  @ApiProperty({ example: 'ASSIGNED', required: false })
  @IsOptional() @IsString()
  status?: string;
}
