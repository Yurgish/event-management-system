import { tool } from 'ai';
import { z as schema } from 'zod';

import type { EventService } from '@/event/event.service';
import type { UserService } from '@/user/user.service';

type MyEventItem = Awaited<
  ReturnType<UserService['findMyEvents']>
>['events'][number];

function toIso(value: Date | string) {
  return new Date(value).toISOString();
}

function inRange(date: Date, from?: Date, to?: Date) {
  if (from && date < from) {
    return false;
  }

  if (to && date > to) {
    return false;
  }

  return true;
}

function mapMyEvent(event: MyEventItem, userId: string) {
  return {
    id: event.id,
    title: event.title,
    dateTime: toIso(event.dateTime),
    location: event.location,
    isOrganizer: event.organizerId === userId,
  };
}

function parseDateOrUndefined(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function filterByMode(events: MyEventItem[], userId: string, mode: string) {
  const now = new Date();

  if (mode === 'organized') {
    return events.filter((event) => event.organizerId === userId);
  }

  if (mode === 'attending') {
    return events.filter((event) => event.organizerId !== userId);
  }

  if (mode === 'upcoming') {
    return events.filter((event) => new Date(event.dateTime) >= now);
  }

  if (mode === 'past') {
    return events.filter((event) => new Date(event.dateTime) < now);
  }

  return events;
}

export function buildEventTools(
  eventService: EventService,
  userService: UserService,
  userId: string,
) {
  return {
    count_all_my_events: tool({
      description:
        'Count all events where the current user is organizer or participant.',
      inputSchema: schema.object({}),
      execute: async () => {
        const myEvents = await userService.findMyEvents(userId);

        return { total: myEvents.events.length };
      },
    }),

    list_my_events: tool({
      description:
        'List user events by mode and optional date range. Modes: all, organized, attending, upcoming, past.',
      inputSchema: schema.object({
        mode: schema
          .enum(['all', 'organized', 'attending', 'upcoming', 'past'])
          .default('all'),
        fromIso: schema.iso.datetime().optional(),
        toIso: schema.iso.datetime().optional(),
        limit: schema.number().int().min(1).max(50).default(20),
      }),
      execute: async ({ mode, fromIso, toIso, limit }) => {
        const myEvents = await userService.findMyEvents(userId);
        const from = parseDateOrUndefined(fromIso);
        const to = parseDateOrUndefined(toIso);

        const items = filterByMode(myEvents.events, userId, mode)
          .filter((event) => inRange(new Date(event.dateTime), from, to))
          .slice(0, limit)
          .map((event) => mapMyEvent(event, userId));

        return { total: items.length, items };
      },
    }),

    list_my_events_previous_week: tool({
      description: 'List user events from previous 7 days.',
      inputSchema: schema.object({}),
      execute: async () => {
        const now = new Date();
        const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const myEvents = await userService.findMyEvents(userId);

        const items = myEvents.events
          .filter((event) => inRange(new Date(event.dateTime), from, now))
          .map((event) => mapMyEvent(event, userId));

        return { total: items.length, items };
      },
    }),

    list_public_events_by_tags: tool({
      description:
        'List public events using tag keywords/slugs and optional date range.',
      inputSchema: schema.object({
        tagSlugs: schema.array(schema.string().min(1)).min(1),
        fromIso: schema.iso.datetime().optional(),
        toIso: schema.iso.datetime().optional(),
        limit: schema.number().int().min(1).max(50).default(20),
      }),
      execute: async ({ tagSlugs, fromIso, toIso: toDateStr, limit }) => {
        const data = await eventService.findAllPublic(
          {
            page: 1,
            limit,
            tagSlugs,
          },
          userId,
        );

        const from = parseDateOrUndefined(fromIso);
        const to = parseDateOrUndefined(toDateStr);

        const items = data.items
          .filter((event) => inRange(new Date(event.dateTime), from, to))
          .map((event) => ({
            id: event.id,
            title: event.title,
            dateTime: toIso(event.dateTime),
            location: event.location,
            tags: event.tags?.map((tag) => ({
              slug: tag.slug,
              label: tag.label,
              color: tag.color,
            })),
          }));

        return {
          total: items.length,
          items,
        };
      },
    }),
  };
}
