import { stepCountIs, ToolLoopAgent } from 'ai';

import { buildSystemPrompt } from '@/assistant/assistant.prompts';
import { getGroqClient } from '@/assistant/groq.client';
import { buildAssistantTools } from '@/assistant/tools';
import type { EventService } from '@/event/event.service';
import type { TagsService } from '@/tags/tags.service';
import type { UserService } from '@/user/user.service';

export function createEventAssistant(
  userId: string,
  eventService: EventService,
  userService: UserService,
  tagsService: TagsService,
) {
  const groq = getGroqClient();

  return new ToolLoopAgent({
    model: groq('llama-3.1-8b-instant'),
    instructions: buildSystemPrompt(new Date()),
    tools: buildAssistantTools(eventService, userService, tagsService, userId),
    stopWhen: stepCountIs(20),
    toolChoice: 'auto',
    temperature: 0.5,
  });
}
