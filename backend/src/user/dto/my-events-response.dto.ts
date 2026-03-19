import { ApiProperty } from '@nestjs/swagger';

import { UserEventCalendarItemDto } from '@/user/dto/user-event-calendar-item.dto';

export class UserResponseDto {
  @ApiProperty({ example: 'cm123abc' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;
}

export class MyEventsResponseDto {
  @ApiProperty({ type: [UserEventCalendarItemDto] })
  events: UserEventCalendarItemDto[];
}
