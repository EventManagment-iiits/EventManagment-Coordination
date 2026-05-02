import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  public notifications: Notification[] = [];

  private genId(): string {
    return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  findAll(userId?: string): Notification[] {
    if (userId) return this.notifications.filter((n) => n.userId === userId);
    return this.notifications;
  }

  create(dto: CreateNotificationDto): Notification {
    const record: Notification = {
      id: this.genId(),
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type || 'info',
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(record);
    return record;
  }
}
