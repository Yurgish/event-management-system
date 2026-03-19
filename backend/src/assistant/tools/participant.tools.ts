import { tool } from 'ai';
import { z } from 'zod';

import type { EventService } from '@/event/event.service';
import type { UserService } from '@/user/user.service';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

async function resolveEventIdByTitle(
  eventService: EventService,
  userService: UserService,
  userId: string,
  title: string,
) {
  const query = normalize(title);

  const myEvents = await userService.findMyEvents(userId);
  const ownMatch = myEvents.events.find(
    (event) => normalize(event.title) === query,
  );

  if (ownMatch) {
    return ownMatch.id;
  }

  const publicEvents = await eventService.findAllPublic(
    {
      page: 1,
      limit: 20,
      search: title,
    },
    userId,
  );

  const exactPublicMatch = publicEvents.items.find(
    (event) => normalize(event.title) === query,
  );

  if (exactPublicMatch) {
    return exactPublicMatch.id;
  }

  return publicEvents.items[0]?.id;
}

export function buildParticipantTools(
  eventService: EventService,
  userService: UserService,
  userId: string,
) {
  return {
    get_event_participants: tool({
      description:
        'Get the list of participants for a specific event. Use when user asks: - "Who is attending X?" - "Who joined X?" - "Participants of X" - "How many people are going to X?" Pass the event title (full or partial).',
      inputSchema: z.object({
        title: z.string().min(1),
      }),
      execute: async ({ title }) => {
        const eventId = await resolveEventIdByTitle(
          eventService,
          userService,
          userId,
          title,
        );

        if (!eventId) {
          return { found: false };
        }

        const event = await eventService.findOne(eventId);

        return {
          found: true,
          title: event.title,
          participants: event.participants.map((participant) => ({
            id: participant.user.id,
            name: participant.user.name,
          })),
        };
      },
    }),

    get_event_location: tool({
      description: 'Get location for a given event title.',
      inputSchema: z.object({
        title: z.string().min(1),
      }),
      execute: async ({ title }) => {
        const eventId = await resolveEventIdByTitle(
          eventService,
          userService,
          userId,
          title,
        );

        if (!eventId) {
          return { found: false };
        }

        const event = await eventService.findOne(eventId);

        return {
          found: true,
          title: event.title,
          location: event.location,
          dateTime: new Date(event.dateTime).toISOString(),
        };
      },
    }),
  };
}
