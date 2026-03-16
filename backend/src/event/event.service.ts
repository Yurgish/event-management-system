import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

import {
  buildPaginatedResult,
  getPaginationParams,
} from '@/common/utils/pagination.util';
import { CreateEventDto } from '@/event/dto/create-event.dto';
import { ListEventsQueryDto } from '@/event/dto/list-events-query.dto';
import { UpdateEventDto } from '@/event/dto/update-event.dto';
import { ParticipantService } from '@/participant/participant.service';
import { PrismaService } from '@/prisma/prisma.service';

const TAG_SELECT = {
  select: {
    tag: {
      select: { id: true, slug: true, label: true, color: true },
    },
  },
  orderBy: { tag: { sortOrder: 'asc' as const } },
} as const;

/** Used for list, create, update — no participant list, only count. */
const EVENT_SUMMARY_SELECT = {
  id: true,
  title: true,
  description: true,
  dateTime: true,
  location: true,
  capacity: true,
  isPublic: true,
  createdAt: true,
  organizerId: true,
  organizer: { select: { id: true, name: true } },
  _count: { select: { participants: true } },
} as const;

const EVENT_PUBLIC_LIST_SELECT = {
  ...EVENT_SUMMARY_SELECT,
  tags: TAG_SELECT,
} as const;

/** Used for single-event detail — includes full participant list. */
const EVENT_DETAIL_SELECT = {
  ...EVENT_SUMMARY_SELECT,
  tags: TAG_SELECT,
  participants: {
    select: {
      userId: true,
      joinedAt: true,
      user: { select: { id: true, name: true } },
    },
  },
} as const;

@Injectable()
export class EventService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly participantService: ParticipantService,
  ) {}

  private async findEventForParticipationOrThrow(eventId: string) {
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        capacity: true,
        _count: { select: { participants: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  private buildWhereClause(query: ListEventsQueryDto): Prisma.EventWhereInput {
    const { search, tags } = query;
    const trimmed = search?.trim();
    const requiredTagIds = Array.from(new Set(tags ?? []));

    return {
      isPublic: true,
      ...(trimmed && {
        OR: [
          { title: { contains: trimmed, mode: 'insensitive' } },
          { description: { contains: trimmed, mode: 'insensitive' } },
          { location: { contains: trimmed, mode: 'insensitive' } },
        ],
      }),
      ...(requiredTagIds.length && {
        AND: requiredTagIds.map((tagId) => ({
          tags: { some: { tag: { id: tagId } } },
        })),
      }),
    };
  }

  private async validateAndResolveTagIds(tagIds?: string[]) {
    if (tagIds === undefined) {
      return undefined;
    }

    const normalizedTagIds = tagIds.map((tagId) => tagId.trim());

    if (normalizedTagIds.some((tagId) => tagId.length === 0)) {
      throw new BadRequestException('tagIds must contain non-empty values');
    }

    const uniqueTagIds = Array.from(new Set(normalizedTagIds));

    if (uniqueTagIds.length !== normalizedTagIds.length) {
      throw new BadRequestException('tagIds must be unique');
    }

    if (uniqueTagIds.length === 0) {
      return [];
    }

    const foundTags = await this.prismaService.tag.findMany({
      where: {
        id: { in: uniqueTagIds },
        isActive: true,
      },
      select: { id: true },
    });

    const foundTagIds = new Set(foundTags.map((tag) => tag.id));
    const missingTagIds = uniqueTagIds.filter(
      (tagId) => !foundTagIds.has(tagId),
    );

    if (missingTagIds.length > 0) {
      throw new BadRequestException(
        `Unknown or inactive tagIds: ${missingTagIds.join(', ')}`,
      );
    }

    return uniqueTagIds;
  }

  async findAllPublic(query: ListEventsQueryDto, userId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { skip, take } = getPaginationParams(page, limit);
    const where = this.buildWhereClause(query);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.event.findMany({
        where,
        select: EVENT_PUBLIC_LIST_SELECT,
        orderBy: { dateTime: 'asc' },
        skip,
        take,
      }),
      this.prismaService.event.count({ where }),
    ]);

    let joinedIds = new Set<string>();

    if (userId && items.length > 0) {
      joinedIds = await this.participantService.findJoinedEventIds(
        userId,
        items.map((item) => item.id),
      );
    }

    const itemsWithIsJoined = items.map((item) => {
      const { tags, ...event } = item;

      return {
        ...event,
        tags: tags.map(({ tag }) => tag),
        isJoined: joinedIds.has(item.id),
      };
    });

    return buildPaginatedResult(itemsWithIsJoined, total, page, limit);
  }

  async findOne(id: string) {
    const event = await this.prismaService.event.findUnique({
      where: { id },
      select: EVENT_DETAIL_SELECT,
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const { tags, ...rest } = event;

    return {
      ...rest,
      tags: tags.map(({ tag }) => tag),
    };
  }

  async create(userId: string, dto: CreateEventDto) {
    if (new Date(dto.dateTime) <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    const { dateTime, tagIds, ...rest } = dto;
    const resolvedTagIds = await this.validateAndResolveTagIds(tagIds);

    return this.prismaService.event.create({
      data: {
        ...rest,
        dateTime: new Date(dateTime),
        organizerId: userId,
        ...(resolvedTagIds?.length && {
          tags: { create: resolvedTagIds.map((tagId) => ({ tagId })) },
        }),
      },
      select: EVENT_SUMMARY_SELECT,
    });
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    const patch = dto as Partial<CreateEventDto>;

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can edit this event');
    }

    if (patch.dateTime && new Date(patch.dateTime) <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    const { dateTime, tagIds, ...rest } = patch;
    const resolvedTagIds = await this.validateAndResolveTagIds(tagIds);

    return this.prismaService.event.update({
      where: { id },
      data: {
        ...rest,
        ...(dateTime && { dateTime: new Date(dateTime) }),
        ...(resolvedTagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: resolvedTagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      select: EVENT_SUMMARY_SELECT,
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can delete this event');
    }

    await this.prismaService.event.delete({ where: { id } });
  }

  async join(eventId: string, userId: string) {
    const event = await this.findEventForParticipationOrThrow(eventId);

    if (
      event.capacity !== null &&
      event._count.participants >= event.capacity
    ) {
      throw new BadRequestException('This event is full');
    }

    return this.participantService.join(eventId, userId);
  }

  async leave(eventId: string, userId: string) {
    await this.findEventForParticipationOrThrow(eventId);

    await this.participantService.leave(eventId, userId);
  }
}
