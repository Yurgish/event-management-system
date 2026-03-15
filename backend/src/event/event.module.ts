import { Module } from '@nestjs/common';

import { EventController } from '@/event/event.controller';
import { EventService } from '@/event/event.service';
import { ParticipantModule } from '@/participant/participant.module';

@Module({
  imports: [ParticipantModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
