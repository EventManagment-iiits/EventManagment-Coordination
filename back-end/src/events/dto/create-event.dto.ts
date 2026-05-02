import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Innovators Forum 2026' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'A day of discovery and demos.', required: false })
  @IsOptional() @IsString() @MaxLength(800)
  description?: string;

  @ApiProperty({ example: '', required: false })
  @IsOptional() @IsString()
  imageUrl?: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsString() @IsNotEmpty()
  eventDate: string;

  @ApiProperty({ example: '09:00' })
  @IsString() @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsString() @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 250 })
  @IsInt() @Min(1)
  capacity: number;

  @ApiProperty({ example: 'u3' })
  @IsString() @IsNotEmpty()
  organizerId: string;

  @ApiProperty({ example: 'v1' })
  @IsString() @IsNotEmpty()
  venueId: string;
}
