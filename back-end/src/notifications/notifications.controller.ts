import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.ATTENDEE, Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'List notifications (optionally filter by userId)' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200 })
  findAll(@Query('userId') userId?: string) {
    return this.notificationsService.findAll(userId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.ATTENDEE, Role.STAFF, Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a notification' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'Notification created' })
  create(@Body() dto: CreateNotificationDto) {
    return { ok: true, record: this.notificationsService.create(dto) };
  }
}
