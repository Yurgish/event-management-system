import { ApiProperty } from '@nestjs/swagger';

import {
  ParticipationResponseDto,
  UserEventCalendarItemDto,
} from '@/user/dto/user-event-calendar-item.dto';

export class MyEventsResponseDto {
  @ApiProperty({ type: [UserEventCalendarItemDto] })
  organizedEvents: UserEventCalendarItemDto[];

  @ApiProperty({ type: [ParticipationResponseDto] })
  participations: ParticipationResponseDto[];
}
