import { ApiProperty } from '@nestjs/swagger';

export class EventUserSummaryDto {
  @ApiProperty({ example: 'cm8xabcd1234' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}

export class EventCountDto {
  @ApiProperty({ example: 12 })
  participants: number;
}

export class EventParticipantDto {
  @ApiProperty({ example: 'cm8xparticipant123' })
  userId: string;

  @ApiProperty({ example: '2026-06-10T10:00:00.000Z', format: 'date-time' })
  joinedAt: string;

  @ApiProperty({ type: () => EventUserSummaryDto })
  user: EventUserSummaryDto;
}
