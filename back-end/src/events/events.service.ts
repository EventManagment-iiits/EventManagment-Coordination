import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { VenuesService } from '../venues/venues.service';

@Injectable()
export class EventsService {
  public events: Event[] = [];

  constructor(private readonly venuesService: VenuesService) {}

  private genId(): string {
    return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): Event[] {
    return this.events;
  }

  findOne(id: string): Event {
    const e = this.events.find((x) => x.id === id);
    if (!e) throw new NotFoundException('Event not found.');
    return e;
  }

  findByOrganizer(organizerId: string): Event[] {
    return this.events.filter((e) => e.organizerId === organizerId);
  }

  private venueHasConflict(venueId: string, eventDate: string, startTime: string, endTime: string, excludeId?: string): boolean {
    const sameDay = this.events.filter(
      (e) => e.venueId === venueId && e.eventDate === eventDate && e.id !== excludeId,
    );
    return sameDay.some((x) => !(endTime <= x.startTime || startTime >= x.endTime));
  }

  create(dto: CreateEventDto): Event {
    const venue = this.venuesService.findOne(dto.venueId);
    if (dto.capacity > venue.capacity) {
      throw new BadRequestException('Event capacity cannot exceed venue capacity.');
    }
    if (this.venueHasConflict(dto.venueId, dto.eventDate, dto.startTime, dto.endTime)) {
      throw new BadRequestException('Venue is already booked for the selected time.');
    }
    const record: Event = {
      id: this.genId(),
      title: dto.title.trim(),
      description: (dto.description || '').trim(),
      imageUrl: (dto.imageUrl || '').trim(),
      eventDate: dto.eventDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      capacity: dto.capacity,
      organizerId: dto.organizerId,
      venueId: dto.venueId,
    };
    this.events.push(record);
    return record;
  }

  update(id: string, dto: UpdateEventDto): Event {
    const idx = this.events.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Event not found.');

    const next = { ...this.events[idx], ...dto };
    const venue = this.venuesService.findOne(next.venueId);
    if (Number(next.capacity) > venue.capacity) {
      throw new BadRequestException('Event capacity cannot exceed venue capacity.');
    }
    if (this.venueHasConflict(next.venueId, next.eventDate, next.startTime, next.endTime, id)) {
      throw new BadRequestException('Venue is already booked for the selected time.');
    }
    if (dto.capacity != null) next.capacity = Number(dto.capacity);
    this.events[idx] = next;
    return this.events[idx];
  }

  remove(id: string): { ok: boolean } {
    const idx = this.events.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Event not found.');
    this.events.splice(idx, 1);
    return { ok: true };
  }
}
