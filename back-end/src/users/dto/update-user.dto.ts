import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsEmail() @MaxLength(150)
  email?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  role?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  status?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(120)
  orgDept?: string;
}
