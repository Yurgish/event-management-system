import { ApiProperty } from '@nestjs/swagger';

export class ParticipantRecordDto {
  @ApiProperty({ example: 'cm8xabcd1234' })
  eventId: string;

  @ApiProperty({ example: 'cm8xuser1234' })
  userId: string;

  @ApiProperty({ example: '2026-06-10T10:00:00.000Z', format: 'date-time' })
  joinedAt: string;
}
