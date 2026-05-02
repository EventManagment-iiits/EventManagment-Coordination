import { Module, forwardRef } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { VenuesModule } from '../venues/venues.module';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [VenuesModule, forwardRef(() => RegistrationsModule)],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
