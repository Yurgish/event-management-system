import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  EventCountDto,
  EventParticipantDto,
  EventUserSummaryDto,
} from '@/event/dto/event-shared.dto';

/** Returned by list, create, and update endpoints — no participant list, only count. */
export class EventSummaryDto {
  @ApiProperty({ example: 'cm8xabcd1234' })
  id: string;

  @ApiProperty({ example: 'NestJS Workshop' })
  title: string;

  @ApiProperty({ example: 'A deep dive into NestJS framework' })
  description: string;

  @ApiProperty({ example: '2026-06-15T14:00:00.000Z', format: 'date-time' })
  dateTime: string;

  @ApiProperty({ example: 'Kyiv, Ukraine' })
  location: string;

  @ApiPropertyOptional({ example: 50, nullable: true })
  capacity: number | null;

  @ApiProperty({ example: true })
  isPublic: boolean;

  @ApiProperty({ example: '2026-06-01T09:00:00.000Z', format: 'date-time' })
  createdAt: string;

  @ApiProperty({ example: 'cm8xorganizer1234' })
  organizerId: string;

  @ApiProperty({ type: () => EventUserSummaryDto })
  organizer: EventUserSummaryDto;

  @ApiProperty({ type: () => EventCountDto })
  _count: EventCountDto;
}

/** Returned by the single-event detail endpoint — includes full participant list. */
export class EventResponseDto extends EventSummaryDto {
  @ApiProperty({ type: () => [EventParticipantDto] })
  participants: EventParticipantDto[];
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedEventsResponseDto {
  @ApiProperty({ type: () => [EventSummaryDto] })
  items: EventSummaryDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}
