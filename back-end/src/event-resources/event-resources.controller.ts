import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { EventResourcesService } from './event-resources.service';
import { CreateEventResourceDto } from './dto/create-event-resource.dto';
import { UpdateEventResourceDto } from './dto/update-event-resource.dto';

@ApiTags('Event Resources')
@Controller('api/event-resources')
export class EventResourcesController {
  constructor(private readonly eventResourcesService: EventResourcesService) {}

  @Get()
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'List all resource allocations' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  findAll() {
    return this.eventResourcesService.findAll();
  }

  @Post()
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create resource allocation' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'Allocation created' })
  create(@Body() dto: CreateEventResourceDto) {
    return { ok: true, record: this.eventResourcesService.create(dto) };
  }

  @Patch(':id')
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Update resource allocation' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Allocation updated' })
  update(@Param('id') id: string, @Body() dto: UpdateEventResourceDto) {
    return { ok: true, record: this.eventResourcesService.update(id, dto) };
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Delete resource allocation' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Allocation deleted' })
  remove(@Param('id') id: string) {
    return this.eventResourcesService.remove(id);
  }
}
