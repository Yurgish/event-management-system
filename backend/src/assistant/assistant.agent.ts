import { stepCountIs, ToolLoopAgent } from 'ai';

import { buildSystemPrompt } from '@/assistant/assistant.prompts';
import { getGroqClient } from '@/assistant/groq.client';
import { buildAssistantTools } from '@/assistant/tools';
import type { EventService } from '@/event/event.service';
import type { UserService } from '@/user/user.service';

export function createEventAssistant(
  userId: string,
  eventService: EventService,
  userService: UserService,
) {
  const groq = getGroqClient();

  return new ToolLoopAgent({
    model: groq('llama-3.3-70b-versatile'),
    instructions: buildSystemPrompt(new Date()),
    tools: buildAssistantTools(eventService, userService, userId),
    stopWhen: stepCountIs(12),
    toolChoice: 'auto',
    temperature: 0.1,
  });
}
