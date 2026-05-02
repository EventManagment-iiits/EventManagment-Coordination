import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { EventStaffService } from './event-staff.service';
import { CreateEventStaffDto } from './dto/create-event-staff.dto';
import { UpdateEventStaffDto } from './dto/update-event-staff.dto';

@ApiTags('Event Staff')
@Controller('api/event-staff')
export class EventStaffController {
  constructor(private readonly eventStaffService: EventStaffService) {}

  @Get()
  @Roles(Role.ORGANIZER, Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'List all staff assignments' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  findAll() {
    return this.eventStaffService.findAll();
  }

  @Post()
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create staff assignment' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'Assignment created' })
  create(@Body() dto: CreateEventStaffDto) {
    return { ok: true, record: this.eventStaffService.create(dto) };
  }

  @Patch(':id')
  @Roles(Role.ORGANIZER, Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'Update staff assignment' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Assignment updated' })
  update(@Param('id') id: string, @Body() dto: UpdateEventStaffDto) {
    return { ok: true, record: this.eventStaffService.update(id, dto) };
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Delete staff assignment' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Assignment deleted' })
  remove(@Param('id') id: string) {
    return this.eventStaffService.remove(id);
  }
}
