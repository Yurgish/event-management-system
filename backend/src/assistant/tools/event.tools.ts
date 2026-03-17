import { tool } from 'ai';
import { z as schema } from 'zod';

import type { EventService } from '@/event/event.service';
import type { TagsService } from '@/tags/tags.service';
import type { UserService } from '@/user/user.service';

type MyEventItem = Awaited<
  ReturnType<UserService['findMyEventsForAssistant']>
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
    tags: event.tags.map((tag) => ({
      slug: tag.slug,
      label: tag.label,
      color: tag.color,
    })),
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

function filterByResolvedTags(
  events: MyEventItem[],
  resolvedTagSlugs: string[],
) {
  if (resolvedTagSlugs.length === 0) {
    return events;
  }

  const tagSet = new Set(resolvedTagSlugs);

  return events.filter((event) =>
    event.tags.some((tag) => tagSet.has(tag.slug)),
  );
}

export function buildEventTools(
  eventService: EventService,
  userService: UserService,
  tagsService: TagsService,
  userId: string,
) {
  return {
    count_all_my_events: tool({
      description:
        'Count user events with optional filters. Supports all, organized, attending, upcoming, past, date range, and human tag queries like backend or tech.',
      inputSchema: schema.object({
        mode: schema
          .enum(['all', 'organized', 'attending', 'upcoming', 'past'])
          .default('all'),
        fromIso: schema.string().optional(),
        toIso: schema.string().optional(),
        tagQueries: schema.array(schema.string().min(1)).optional(),
      }),
      execute: async ({ mode, fromIso, toIso, tagQueries }) => {
        const myEvents = await userService.findMyEventsForAssistant(userId);
        const from = parseDateOrUndefined(fromIso);
        const to = parseDateOrUndefined(toIso);
        const { matchedSlugs, matchedTags, unresolvedQueries } =
          await tagsService.resolveTagQueries(tagQueries ?? []);

        const filtered = filterByResolvedTags(
          filterByMode(myEvents.events, userId, mode).filter((event) =>
            inRange(new Date(event.dateTime), from, to),
          ),
          matchedSlugs,
        );

        return {
          total: filtered.length,
          matchedTags: matchedTags.map((tag) => ({
            slug: tag.slug,
            label: tag.label,
          })),
          unresolvedQueries,
        };
      },
    }),

    list_my_events: tool({
      description:
        'List user events by mode and optional date range or human tag queries. Modes: all, organized, attending, upcoming, past. Supports queries like backend, tech, design, marketing.',
      inputSchema: schema.object({
        mode: schema
          .enum(['all', 'organized', 'attending', 'upcoming', 'past'])
          .default('all'),
        fromIso: schema.string().optional(),
        toIso: schema.string().optional(),
        tagQueries: schema.array(schema.string().min(1)).optional(),
        limit: schema.number().int().min(1).max(50).default(20),
      }),
      execute: async ({ mode, fromIso, toIso, tagQueries, limit }) => {
        const myEvents = await userService.findMyEventsForAssistant(userId);
        const from = parseDateOrUndefined(fromIso);
        const to = parseDateOrUndefined(toIso);
        const { matchedSlugs, matchedTags, unresolvedQueries } =
          await tagsService.resolveTagQueries(tagQueries ?? []);

        const filtered = filterByResolvedTags(
          filterByMode(myEvents.events, userId, mode).filter((event) =>
            inRange(new Date(event.dateTime), from, to),
          ),
          matchedSlugs,
        );

        const items = filtered
          .slice(0, limit)
          .map((event) => mapMyEvent(event, userId));

        return {
          total: filtered.length,
          matchedTags: matchedTags.map((tag) => ({
            slug: tag.slug,
            label: tag.label,
          })),
          unresolvedQueries,
          items,
        };
      },
    }),

    list_my_events_previous_week: tool({
      description: 'List user events from previous 7 days.',
      inputSchema: schema.object({}),
      execute: async () => {
        const now = new Date();
        const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const myEvents = await userService.findMyEventsForAssistant(userId);

        const items = myEvents.events
          .filter((event) => inRange(new Date(event.dateTime), from, now))
          .map((event) => mapMyEvent(event, userId));

        return { total: items.length, items };
      },
    }),

    list_public_events_by_tags: tool({
      description:
        'List public events using human tag queries or slugs and optional date range. Handles case-insensitive input and aliases like tech -> technology.',
      inputSchema: schema.object({
        tagQueries: schema.array(schema.string().min(1)).min(1),
        fromIso: schema.string().optional(),
        toIso: schema.string().optional(),
        limit: schema.number().int().min(1).max(50).default(20),
      }),
      execute: async ({ tagQueries, fromIso, toIso: toDateStr, limit }) => {
        const { matchedSlugs, matchedTags, unresolvedQueries } =
          await tagsService.resolveTagQueries(tagQueries);

        if (matchedSlugs.length === 0) {
          return {
            total: 0,
            matchedTags: [],
            unresolvedQueries,
            items: [],
          };
        }

        const data = await eventService.findAllPublic(
          {
            page: 1,
            limit,
            tagSlugs: matchedSlugs,
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
          matchedTags: matchedTags.map((tag) => ({
            slug: tag.slug,
            label: tag.label,
          })),
          unresolvedQueries,
          items,
        };
      },
    }),
  };
}
