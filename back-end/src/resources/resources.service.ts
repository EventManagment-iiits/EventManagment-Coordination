import { Injectable, NotFoundException } from '@nestjs/common';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  public resources: Resource[] = [];

  private genId(): string {
    return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): Resource[] {
    return this.resources;
  }

  findOne(id: string): Resource {
    const r = this.resources.find((x) => x.id === id);
    if (!r) throw new NotFoundException('Resource not found.');
    return r;
  }

  create(dto: CreateResourceDto): Resource {
    const record: Resource = {
      id: this.genId(),
      resourceName: dto.resourceName.trim(),
      quantity: dto.quantity,
    };
    this.resources.push(record);
    return record;
  }

  update(id: string, dto: UpdateResourceDto): Resource {
    const idx = this.resources.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Resource not found.');
    this.resources[idx] = { ...this.resources[idx], ...dto };
    if (dto.quantity != null) this.resources[idx].quantity = Number(dto.quantity);
    return this.resources[idx];
  }

  remove(id: string): { ok: boolean } {
    const idx = this.resources.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Resource not found.');
    this.resources.splice(idx, 1);
    return { ok: true };
  }
}
