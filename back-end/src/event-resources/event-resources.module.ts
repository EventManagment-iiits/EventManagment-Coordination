import { Module } from '@nestjs/common';
import { EventResourcesService } from './event-resources.service';
import { EventResourcesController } from './event-resources.controller';

@Module({
  controllers: [EventResourcesController],
  providers: [EventResourcesService],
  exports: [EventResourcesService],
})
export class EventResourcesModule {}
