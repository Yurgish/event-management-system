import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Auth, OptionalAuth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SuccessResponseDto } from '@/common/dto/success-response.dto';
import type { JwtUser } from '@/common/jwt.types';
import {
  CreateEventDto,
  EventResponseDto,
  EventSummaryDto,
  ListEventsQueryDto,
  PaginatedEventsResponseDto,
  ParticipantRecordDto,
  UpdateEventDto,
} from '@/event/dto';
import { EventService } from '@/event/event.service';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @OptionalAuth()
  @ApiOperation({ summary: 'Get public events with pagination and search' })
  @ApiOkResponse({
    description: 'Paginated list of public events with participant count.',
    type: PaginatedEventsResponseDto,
  })
  findAll(@Query() query: ListEventsQueryDto, @CurrentUser() user?: JwtUser) {
    return this.eventService.findAllPublic(query, user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiParam({ name: 'id', example: 'cm8xabcd1234' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiNotFoundResponse({ description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Post()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new event' })
  @ApiCreatedResponse({ type: EventSummaryDto })
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateEventDto) {
    return this.eventService.create(user.id, dto);
  }

  @Patch(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit event (organizer only)' })
  @ApiParam({ name: 'id', example: 'cm8xabcd1234' })
  @ApiForbiddenResponse({
    description: 'Only the organizer can edit this event',
  })
  @ApiOkResponse({ type: EventSummaryDto })
  @ApiNotFoundResponse({ description: 'Event not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(id, user.id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event (organizer only)' })
  @ApiParam({ name: 'id', example: 'cm8xabcd1234' })
  @ApiForbiddenResponse({
    description: 'Only the organizer can delete this event',
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiNoContentResponse({ description: 'Event deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventService.remove(id, user.id);
  }

  @Post(':id/join')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join event' })
  @ApiParam({ name: 'id', example: 'cm8xabcd1234' })
  @ApiConflictResponse({ description: 'Already joined' })
  @ApiOkResponse({ type: ParticipantRecordDto })
  @HttpCode(HttpStatus.OK)
  join(@Param('id') eventId: string, @CurrentUser() user: JwtUser) {
    return this.eventService.join(eventId, user.id);
  }

  @Post(':id/leave')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave event' })
  @ApiParam({ name: 'id', example: 'cm8xabcd1234' })
  @ApiNotFoundResponse({ description: 'Not a participant' })
  @ApiOkResponse({ type: SuccessResponseDto })
  @HttpCode(HttpStatus.OK)
  async leave(@Param('id') eventId: string, @CurrentUser() user: JwtUser) {
    await this.eventService.leave(eventId, user.id);
    return { success: true };
  }
}
