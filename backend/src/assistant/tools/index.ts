import { buildEventTools } from '@/assistant/tools/event.tools';
import { buildParticipantTools } from '@/assistant/tools/participant.tools';
import type { EventService } from '@/event/event.service';
import type { UserService } from '@/user/user.service';

export function buildAssistantTools(
  eventService: EventService,
  userService: UserService,
  userId: string,
) {
  return {
    ...buildEventTools(eventService, userService, userId),
    ...buildParticipantTools(eventService, userService, userId),
  };
}
