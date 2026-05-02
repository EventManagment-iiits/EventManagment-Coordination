import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@Controller('api/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles(Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'List all attendance records' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200 })
  findAll() {
    return this.attendanceService.findAll();
  }

  @Patch('registration/:regId')
  @Roles(Role.STAFF, Role.SUPER_USER)
  @ApiOperation({ summary: 'Update attendance by registration ID' })
  @ApiHeader({ name: 'x-user-role', required: true })
  @ApiResponse({ status: 200, description: 'Attendance updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  updateByRegistration(@Param('regId') regId: string, @Body() dto: UpdateAttendanceDto) {
    return { ok: true, record: this.attendanceService.updateByRegistration(regId, dto) };
  }
}
