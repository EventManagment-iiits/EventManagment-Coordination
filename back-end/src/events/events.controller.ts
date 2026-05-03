import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegistrationsService } from '../registrations/registrations.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.ATTENDEE, Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'List all events' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'List of events' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.ATTENDEE, Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 }) @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get('organizer/:organizerId')
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get events by organizer ID' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  findByOrganizer(@Param('organizerId') organizerId: string) {
    return this.eventsService.findByOrganizer(organizerId);
  }

  @Get(':id/registrations-count')
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.ATTENDEE, Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get registration count for an event' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  registrationsCount(@Param('id') id: string) {
    return { count: this.registrationsService.countByEvent(id) };
  }

  @Post()
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Validation / business rule error' })
  create(@Body() dto: CreateEventDto) {
    return { ok: true, record: this.eventsService.create(dto) };
  }

  @Patch(':id')
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Update event' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Event updated' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return { ok: true, record: this.eventsService.update(id, dto) };
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Delete event' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Event deleted' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
