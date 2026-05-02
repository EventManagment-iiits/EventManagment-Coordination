import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@emcp.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString() @IsNotEmpty()
  password: string;
}
