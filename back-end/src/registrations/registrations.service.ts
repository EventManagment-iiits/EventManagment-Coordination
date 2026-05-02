import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { Registration } from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { EventsService } from '../events/events.service';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class RegistrationsService {
  public registrations: Registration[] = [];

  constructor(
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly attendanceService: AttendanceService,
  ) {}

  private genId(): string {
    return `reg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): Registration[] {
    return this.registrations;
  }

  findOne(id: string): Registration {
    const r = this.registrations.find((x) => x.id === id);
    if (!r) throw new NotFoundException('Registration not found.');
    return r;
  }

  findByEvent(eventId: string): Registration[] {
    return this.registrations.filter((r) => r.eventId === eventId);
  }

  findByUser(userId: string): Registration[] {
    return this.registrations.filter((r) => r.userId === userId);
  }

  countByEvent(eventId: string): number {
    return this.registrations.filter((r) => r.eventId === eventId).length;
  }

  create(dto: CreateRegistrationDto): Registration {
    const event = this.eventsService.findOne(dto.eventId);

    if (this.registrations.some((r) => r.userId === dto.userId && r.eventId === dto.eventId)) {
      throw new BadRequestException('You are already registered for this event.');
    }

    const count = this.countByEvent(dto.eventId);
    if (count >= event.capacity) {
      throw new BadRequestException('House Full: event capacity reached.');
    }

    const record: Registration = {
      id: this.genId(),
      userId: dto.userId,
      eventId: dto.eventId,
      status: 'CONFIRMED',
      registrationDate: new Date().toISOString(),
    };
    this.registrations.push(record);

    // Auto-create attendance record
    this.attendanceService.createForRegistration(record.id);

    return record;
  }

  remove(id: string): { ok: boolean } {
    const idx = this.registrations.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Registration not found.');
    this.registrations.splice(idx, 1);
    this.attendanceService.removeByRegistration(id);
    return { ok: true };
  }
}
