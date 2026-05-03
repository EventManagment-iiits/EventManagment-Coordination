import { Injectable, NotFoundException } from '@nestjs/common';
import { EventStaff } from './entities/event-staff.entity';
import { CreateEventStaffDto } from './dto/create-event-staff.dto';
import { UpdateEventStaffDto } from './dto/update-event-staff.dto';

@Injectable()
export class EventStaffService {
  public assignments: EventStaff[] = [];

  private genId(): string {
    return `as_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): EventStaff[] {
    return this.assignments;
  }

  findOne(id: string): EventStaff {
    const a = this.assignments.find((x) => x.id === id);
    if (!a) throw new NotFoundException('Assignment not found.');
    return a;
  }

  create(dto: CreateEventStaffDto): EventStaff {
    const record: EventStaff = {
      id: this.genId(),
      eventId: dto.eventId,
      staffId: dto.staffId,
      role: dto.role.trim(),
      shiftStart: dto.shiftStart,
      shiftEnd: dto.shiftEnd,
      status: dto.status || 'ASSIGNED',
    };
    this.assignments.push(record);
    return record;
  }

  update(id: string, dto: UpdateEventStaffDto): EventStaff {
    const idx = this.assignments.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Assignment not found.');
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) patch[key] = value;
    }
    this.assignments[idx] = { ...this.assignments[idx], ...patch };
    return this.assignments[idx];
  }

  remove(id: string): { ok: boolean } {
    const idx = this.assignments.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Assignment not found.');
    this.assignments.splice(idx, 1);
    return { ok: true };
  }

  removeByEvent(eventId: string): void {
    this.assignments = this.assignments.filter((a) => a.eventId !== eventId);
  }

  removeByStaff(staffId: string): void {
    this.assignments = this.assignments.filter((a) => a.staffId !== staffId);
  }
}
