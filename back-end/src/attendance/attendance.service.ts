import { Injectable, NotFoundException } from '@nestjs/common';
import { Attendance } from './entities/attendance.entity';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  public attendance: Attendance[] = [];

  private genId(): string {
    return `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): Attendance[] {
    return this.attendance;
  }

  createForRegistration(registrationId: string): Attendance {
    const record: Attendance = {
      id: this.genId(),
      registrationId,
      status: 'PENDING',
      attendanceTime: null,
    };
    this.attendance.push(record);
    return record;
  }

  updateByRegistration(regId: string, dto: UpdateAttendanceDto): Attendance {
    const idx = this.attendance.findIndex((a) => a.registrationId === regId);
    if (idx === -1) throw new NotFoundException('Attendance record not found.');
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) patch[key] = value;
    }
    this.attendance[idx] = { ...this.attendance[idx], ...patch };
    return this.attendance[idx];
  }

  removeByRegistration(regId: string): void {
    this.attendance = this.attendance.filter((a) => a.registrationId !== regId);
  }
}
