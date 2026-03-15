import { Module } from '@nestjs/common';

import { ParticipantService } from '@/participant/participant.service';

@Module({
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}
