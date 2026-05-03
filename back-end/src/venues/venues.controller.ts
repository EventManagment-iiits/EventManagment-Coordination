import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.ATTENDEE, Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'List all venues' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'List of venues' })
  findAll() {
    return this.venuesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.ATTENDEE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get venue by ID' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Venue details' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'Venue created' })
  create(@Body() dto: CreateVenueDto) {
    return { ok: true, record: this.venuesService.create(dto) };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_USER)
  @ApiOperation({ summary: 'Update venue' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Venue updated' })
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return { ok: true, record: this.venuesService.update(id, dto) };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_USER)
  @ApiOperation({ summary: 'Delete venue' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Venue deleted' })
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
