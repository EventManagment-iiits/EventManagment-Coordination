import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({ example: 'Grand Auditorium' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  venueName: string;

  @ApiProperty({ example: 'Main Campus, Building 4', required: false })
  @IsOptional() @IsString() @MaxLength(200)
  location?: string;

  @ApiProperty({ example: 500 })
  @IsInt() @Min(1)
  capacity: number;

  @ApiProperty({ example: 'Active', required: false })
  @IsOptional() @IsString()
  status?: string;
}
