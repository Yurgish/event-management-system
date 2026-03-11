import { Injectable } from '@nestjs/common';

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

  findMyEvents(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        organizedEvents: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            location: true,
            capacity: true,
            isPublic: true,
            _count: { select: { participants: true } },
          },
          orderBy: { dateTime: 'asc' },
        },
        participations: {
          select: {
            joinedAt: true,
            event: {
              select: {
                id: true,
                title: true,
                dateTime: true,
                location: true,
                capacity: true,
                isPublic: true,
                organizerId: true,
                _count: { select: { participants: true } },
              },
            },
          },
          orderBy: { event: { dateTime: 'asc' } },
        },
      },
    });
  }
}
