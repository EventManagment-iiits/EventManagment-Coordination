import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateEventResourceDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() eventId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() resourceId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) quantityUsed?: number;
}
