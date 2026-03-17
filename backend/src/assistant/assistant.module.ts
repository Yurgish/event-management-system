import { Module } from '@nestjs/common';

import { AssistantController } from '@/assistant/assistant.controller';
import { AssistantService } from '@/assistant/assistant.service';
import { EventModule } from '@/event/event.module';
import { TagsModule } from '@/tags/tags.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [EventModule, UserModule, TagsModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
