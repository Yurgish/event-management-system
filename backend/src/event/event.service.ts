import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  buildPaginatedResult,
  getPaginationParams,
} from '@/common/utils/pagination.util';
import {
  CreateEventDto,
  ListEventsQueryDto,
  UpdateEventDto,
} from '@/event/dto';
import { ParticipantService } from '@/participant/participant.service';
import { PrismaService } from '@/prisma/prisma.service';

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

/** Used for single-event detail — includes full participant list. */
const EVENT_SELECT = {
  ...EVENT_SUMMARY_SELECT,
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

  private buildPublicWhereClause(search?: string) {
    return {
      isPublic: true,
      ...(search?.trim()
        ? {
            OR: [
              {
                title: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                location: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
  }

  async findAllPublic(query: ListEventsQueryDto, userId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { skip, take } = getPaginationParams(page, limit);
    const where = this.buildPublicWhereClause(query.search);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.event.findMany({
        where,
        select: EVENT_SUMMARY_SELECT,
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

    const itemsWithIsJoined = items.map((item) => ({
      ...item,
      isJoined: joinedIds.has(item.id),
    }));

    return buildPaginatedResult(itemsWithIsJoined, total, page, limit);
  }

  async findOne(id: string) {
    const event = await this.prismaService.event.findUnique({
      where: { id },
      select: EVENT_SELECT,
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(userId: string, dto: CreateEventDto) {
    if (new Date(dto.dateTime) <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    const { dateTime, ...rest } = dto;

    return this.prismaService.event.create({
      data: { ...rest, dateTime: new Date(dateTime), organizerId: userId },
      select: EVENT_SUMMARY_SELECT,
    });
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can edit this event');
    }

    if (dto.dateTime && new Date(dto.dateTime) <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    const { dateTime, ...rest } = dto;

    return this.prismaService.event.update({
      where: { id },
      data: {
        ...rest,
        ...(dateTime && { dateTime: new Date(dateTime) }),
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
