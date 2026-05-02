import { Injectable, NotFoundException } from '@nestjs/common';
import { EventResource } from './entities/event-resource.entity';
import { CreateEventResourceDto } from './dto/create-event-resource.dto';
import { UpdateEventResourceDto } from './dto/update-event-resource.dto';

@Injectable()
export class EventResourcesService {
  public allocations: EventResource[] = [];

  private genId(): string {
    return `er_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): EventResource[] {
    return this.allocations;
  }

  findOne(id: string): EventResource {
    const a = this.allocations.find((x) => x.id === id);
    if (!a) throw new NotFoundException('Allocation not found.');
    return a;
  }

  create(dto: CreateEventResourceDto): EventResource {
    const record: EventResource = {
      id: this.genId(),
      eventId: dto.eventId,
      resourceId: dto.resourceId,
      quantityUsed: dto.quantityUsed,
    };
    this.allocations.push(record);
    return record;
  }

  update(id: string, dto: UpdateEventResourceDto): EventResource {
    const idx = this.allocations.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Allocation not found.');
    this.allocations[idx] = { ...this.allocations[idx], ...dto };
    if (dto.quantityUsed != null) this.allocations[idx].quantityUsed = Number(dto.quantityUsed);
    return this.allocations[idx];
  }

  remove(id: string): { ok: boolean } {
    const idx = this.allocations.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Allocation not found.');
    this.allocations.splice(idx, 1);
    return { ok: true };
  }

  removeByEvent(eventId: string): void {
    this.allocations = this.allocations.filter((a) => a.eventId !== eventId);
  }

  removeByResource(resourceId: string): void {
    this.allocations = this.allocations.filter((a) => a.resourceId !== resourceId);
  }
}
