import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateEventResourceDto {
  @ApiProperty({ example: 'e1' })
  @IsString() @IsNotEmpty()
  eventId: string;

  @ApiProperty({ example: 'r1' })
  @IsString() @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ example: 2 })
  @IsInt() @Min(1)
  quantityUsed: number;
}
