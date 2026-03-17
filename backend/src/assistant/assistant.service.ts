import { Injectable } from '@nestjs/common';

import { createEventAssistant } from '@/assistant/assistant.agent';
import { EventService } from '@/event/event.service';
import { UserService } from '@/user/user.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UserService,
  ) {}

  askStream(userId: string, message: string) {
    const prompt = message.trim();

    const agent = createEventAssistant(
      userId,
      this.eventService,
      this.userService,
    );

    return agent.stream({ prompt: prompt || 'Hello' });
  }
}
