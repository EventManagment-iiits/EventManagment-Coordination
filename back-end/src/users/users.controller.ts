import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  signup(@Body() dto: CreateUserDto) {
    const user = this.usersService.create(dto);
    const { password, ...rest } = user;
    return { ok: true, record: rest };
  }

  @Get()
  @Roles(Role.SUPER_USER, Role.ORGANIZER)
  @ApiOperation({ summary: 'List all users' })
  @ApiHeader({ name: 'x-user-role', required: true, description: 'Role of the requesting user' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_USER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (admin)' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 201, description: 'User created' })
  create(@Body() dto: CreateUserDto) {
    const user = this.usersService.create(dto);
    const { password, ...rest } = user;
    return { ok: true, record: rest };
  }

  @Patch(':id')
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Update user' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'User updated' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return { ok: true, record: this.usersService.update(id, dto) };
  }

  @Delete(':id')
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Delete user' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'User deleted' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
