import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ParticipantService {
  constructor(private readonly prismaService: PrismaService) {}

  async findJoinedEventIds(userId: string, eventIds: string[]) {
    if (eventIds.length === 0) {
      return new Set<string>();
    }

    const participations = await this.prismaService.participant.findMany({
      where: { userId, eventId: { in: eventIds } },
      select: { eventId: true },
    });

    return new Set(participations.map((item) => item.eventId));
  }

  async join(eventId: string, userId: string) {
    const existingParticipant = await this.prismaService.participant.findUnique(
      {
        where: { userId_eventId: { userId, eventId } },
      },
    );

    if (existingParticipant) {
      throw new ConflictException('You have already joined this event');
    }

    return this.prismaService.participant.create({
      data: { eventId, userId },
    });
  }

  async leave(eventId: string, userId: string) {
    const participant = await this.prismaService.participant.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant of this event');
    }

    await this.prismaService.participant.delete({
      where: { userId_eventId: { userId, eventId } },
    });
  }
}
