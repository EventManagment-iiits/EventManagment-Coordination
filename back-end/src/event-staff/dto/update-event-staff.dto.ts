import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateEventStaffDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() eventId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() staffId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) role?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() shiftStart?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() shiftEnd?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
}
