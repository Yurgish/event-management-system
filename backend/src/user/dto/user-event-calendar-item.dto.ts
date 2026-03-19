import { ApiProperty } from '@nestjs/swagger';

export class UserEventCalendarItemDto {
  @ApiProperty({ example: 'cm8xabcd1234' })
  id: string;

  @ApiProperty({ example: 'NestJS Workshop' })
  title: string;

  @ApiProperty({ example: '2026-06-15T14:00:00.000Z', format: 'date-time' })
  dateTime: string;

  @ApiProperty({ example: 'Kyiv, Ukraine' })
  location: string;

  @ApiProperty({ example: 'cm8xorganizer1234' })
  organizerId: string;

  @ApiProperty({ example: '#3B82F6', nullable: true })
  firstTagColor: string | null;
}
