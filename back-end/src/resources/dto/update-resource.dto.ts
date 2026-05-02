import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateResourceDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(150)
  resourceName?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0)
  quantity?: number;
}
