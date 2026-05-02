import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'john@emcp.io' })
  @IsEmail() @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString() @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'ORGANIZER', enum: ['SUPER_USER', 'ADMIN', 'ORGANIZER', 'ATTENDEE', 'STAFF'] })
  @IsString() @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'Active', required: false })
  @IsOptional() @IsString()
  status?: string;

  @ApiProperty({ example: 'CS Dept', required: false })
  @IsOptional() @IsString() @MaxLength(120)
  orgDept?: string;
}
