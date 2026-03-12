import { ApiProperty } from '@nestjs/swagger';

/** Minimal event shape for a calendar cell — organizer's own events. */
export class UserEventCalendarItemDto {
  @ApiProperty({ example: 'cm8xabcd1234' })
  id: string;

  @ApiProperty({ example: 'NestJS Workshop' })
  title: string;

  @ApiProperty({ example: '2026-06-15T14:00:00.000Z', format: 'date-time' })
  dateTime: string;

  @ApiProperty({ example: 'Kyiv, Ukraine' })
  location: string;
}

/** Calendar shape for events the user joined — also carries the organizer id. */
export class JoinedEventCalendarItemDto extends UserEventCalendarItemDto {
  @ApiProperty({ example: 'cm8xorganizer1234' })
  organizerId: string;
}

export class ParticipationResponseDto {
  @ApiProperty({ example: '2026-06-10T10:00:00.000Z', format: 'date-time' })
  joinedAt: string;

  @ApiProperty({ type: () => JoinedEventCalendarItemDto })
  event: JoinedEventCalendarItemDto;
}
