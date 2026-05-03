import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'List all resources' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'List of resources' })
  findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 }) @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'Resource created' })
  create(@Body() dto: CreateResourceDto) {
    return { ok: true, record: this.resourcesService.create(dto) };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_USER)
  @ApiOperation({ summary: 'Update resource' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Resource updated' })
  update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return { ok: true, record: this.resourcesService.update(id, dto) };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_USER)
  @ApiOperation({ summary: 'Delete resource' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Resource deleted' })
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
