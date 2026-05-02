import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
  public users: User[] = [];

  private genId(): string {
    return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...rest }) => rest);
  }

  findOne(id: string): Omit<User, 'password'> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found.');
    const { password, ...rest } = user;
    return rest;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  login(dto: LoginDto): { ok: boolean; user?: Omit<User, 'password'>; error?: string } {
    const user = this.findByEmail(dto.email);
    if (!user || user.password !== dto.password) {
      return { ok: false, error: 'Invalid credentials.' };
    }
    const { password, ...rest } = user;
    return { ok: true, user: rest };
  }

  create(dto: CreateUserDto): User {
    const email = dto.email.trim().toLowerCase();
    if (this.users.some((u) => u.email.toLowerCase() === email)) {
      throw new ConflictException('Email already exists.');
    }
    const record: User = {
      id: this.genId(),
      name: dto.name.trim(),
      email,
      password: dto.password,
      role: dto.role,
      status: dto.status || 'Active',
      orgDept: dto.orgDept || '',
      createdAt: new Date().toISOString(),
    };
    this.users.push(record);
    return record;
  }

  update(id: string, dto: UpdateUserDto): Omit<User, 'password'> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new NotFoundException('User not found.');

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      if (this.users.some((u) => u.id !== id && u.email.toLowerCase() === email)) {
        throw new ConflictException('Email already exists.');
      }
      dto.email = email;
    }

    this.users[idx] = { ...this.users[idx], ...dto };
    const { password, ...rest } = this.users[idx];
    return rest;
  }

  remove(id: string): { ok: boolean } {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new NotFoundException('User not found.');
    this.users.splice(idx, 1);
    return { ok: true };
  }
}
