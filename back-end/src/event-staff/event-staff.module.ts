import { Module } from '@nestjs/common';
import { EventStaffService } from './event-staff.service';
import { EventStaffController } from './event-staff.controller';

@Module({
  controllers: [EventStaffController],
  providers: [EventStaffService],
  exports: [EventStaffService],
})
export class EventStaffModule {}
