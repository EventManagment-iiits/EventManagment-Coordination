import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@ApiTags('Registrations')
@Controller('api/registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get()
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'List all registrations' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  findAll() {
    return this.registrationsService.findAll();
  }

  @Get('event/:eventId')
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get registrations for an event' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  findByEvent(@Param('eventId') eventId: string) {
    return this.registrationsService.findByEvent(eventId);
  }

  @Get('user/:userId')
  @Roles(Role.ATTENDEE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get registrations for a user' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  findByUser(@Param('userId') userId: string) {
    return this.registrationsService.findByUser(userId);
  }

  @Post()
  @Roles(Role.ATTENDEE, Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register for an event' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'Registration created' })
  @ApiResponse({ status: 400, description: 'Already registered / capacity full' })
  create(@Body() dto: CreateRegistrationDto) {
    return { ok: true, record: this.registrationsService.create(dto) };
  }

  @Delete(':id')
  @Roles(Role.ATTENDEE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Cancel registration' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Registration cancelled' })
  remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
