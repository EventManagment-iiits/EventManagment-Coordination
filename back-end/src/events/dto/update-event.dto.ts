import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) title?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(800) description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() eventDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() startTime?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() endTime?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) capacity?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() organizerId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() venueId?: string;
}
