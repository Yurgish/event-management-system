import { Injectable } from '@nestjs/common';

import { createEventAssistant } from '@/assistant/assistant.agent';
import { EventService } from '@/event/event.service';
import { TagsService } from '@/tags/tags.service';
import { UserService } from '@/user/user.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly tagsService: TagsService,
  ) {}

  askStream(userId: string, message: string) {
    const prompt = message.trim();

    const agent = createEventAssistant(
      userId,
      this.eventService,
      this.userService,
      this.tagsService,
    );

    return agent.stream({ prompt: prompt || 'Hello' });
  }
}
