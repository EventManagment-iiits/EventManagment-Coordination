import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateVenueDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(150)
  venueName?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200)
  location?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1)
  capacity?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  status?: string;
}
