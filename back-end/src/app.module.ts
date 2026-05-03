import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';
import { ResourcesModule } from './resources/resources.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EventStaffModule } from './event-staff/event-staff.module';
import { EventResourcesModule } from './event-resources/event-resources.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    UsersModule,
    VenuesModule,
    ResourcesModule,
    EventsModule,
    RegistrationsModule,
    AttendanceModule,
    EventStaffModule,
    EventResourcesModule,
    NotificationsModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    SeedService,
  ],
})
export class AppModule {}
