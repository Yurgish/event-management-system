import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });
  }

  findRefreshHashById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: { refreshToken: true },
    });
  }

  findMe(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }

  create(data: { name: string; email: string; password: string }) {
    return this.prismaService.user.create({ data });
  }

  setRefreshTokenHash(id: string, hash: string) {
    return this.prismaService.user.update({
      where: { id },
      data: { refreshToken: hash },
    });
  }

  clearRefreshToken(id: string) {
    return this.prismaService.user.update({
      where: { id },
      data: { refreshToken: null },
    });
  }

  async findMyEvents(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const events = await this.prismaService.event.findMany({
      where: {
        OR: [{ organizerId: userId }, { participants: { some: { userId } } }],
      },
      select: {
        id: true,
        title: true,
        dateTime: true,
        location: true,
        organizerId: true,
        tags: {
          select: {
            tag: { select: { color: true } },
          },
          orderBy: { tag: { sortOrder: 'asc' } },
          take: 1,
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    return {
      events: events.map((event) => {
        const firstTagColor = event.tags[0]?.tag.color ?? null;

        return {
          id: event.id,
          title: event.title,
          dateTime: event.dateTime,
          location: event.location,
          organizerId: event.organizerId,
          firstTagColor,
        };
      }),
    };
  }

  async findMyEventsForAssistant(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const events = await this.prismaService.event.findMany({
      where: {
        OR: [{ organizerId: userId }, { participants: { some: { userId } } }],
      },
      select: {
        id: true,
        title: true,
        dateTime: true,
        location: true,
        organizerId: true,
        tags: {
          select: {
            tag: {
              select: {
                slug: true,
                label: true,
                color: true,
              },
            },
          },
          orderBy: { tag: { sortOrder: 'asc' } },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    return {
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        dateTime: event.dateTime,
        location: event.location,
        organizerId: event.organizerId,
        tags: event.tags.map(({ tag }) => tag),
      })),
    };
  }
}
