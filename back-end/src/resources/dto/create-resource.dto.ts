import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, MaxLength } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({ example: 'Projector' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  resourceName: string;

  @ApiProperty({ example: 10 })
  @IsInt() @Min(0)
  quantity: number;
}
