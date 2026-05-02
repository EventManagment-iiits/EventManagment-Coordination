import { Injectable, NotFoundException } from '@nestjs/common';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  public venues: Venue[] = [];

  private genId(): string {
    return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): Venue[] {
    return this.venues;
  }

  findOne(id: string): Venue {
    const venue = this.venues.find((v) => v.id === id);
    if (!venue) throw new NotFoundException('Venue not found.');
    return venue;
  }

  create(dto: CreateVenueDto): Venue {
    const record: Venue = {
      id: this.genId(),
      venueName: dto.venueName.trim(),
      location: (dto.location || '').trim(),
      capacity: dto.capacity,
      status: dto.status || 'Active',
    };
    this.venues.push(record);
    return record;
  }

  update(id: string, dto: UpdateVenueDto): Venue {
    const idx = this.venues.findIndex((v) => v.id === id);
    if (idx === -1) throw new NotFoundException('Venue not found.');
    this.venues[idx] = { ...this.venues[idx], ...dto };
    if (dto.capacity != null) this.venues[idx].capacity = Number(dto.capacity);
    return this.venues[idx];
  }

  remove(id: string): { ok: boolean } {
    const idx = this.venues.findIndex((v) => v.id === id);
    if (idx === -1) throw new NotFoundException('Venue not found.');
    this.venues.splice(idx, 1);
    return { ok: true };
  }
}
