import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: 'u4' })
  @IsString() @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'e1' })
  @IsString() @IsNotEmpty()
  eventId: string;
}
