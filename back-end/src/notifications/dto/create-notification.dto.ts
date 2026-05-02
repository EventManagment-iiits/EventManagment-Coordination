import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'u5' })
  @IsString() @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'New task assigned!' })
  @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'You have been added to the support team.' })
  @IsString() @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'info', required: false })
  @IsOptional() @IsString()
  type?: string;
}
