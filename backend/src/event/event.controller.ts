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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/jwt.types';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: 'Get public events with pagination and search' })
  @ApiOkResponse({
    description: 'Paginated list of public events with participant count.',
  })
  findAll(@Query() query: ListEventsQueryDto) {
    return this.eventService.findAllPublic(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiParam({ name: 'id', example: 'cm8xabcd1234' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Post()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new event' })
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
  @HttpCode(HttpStatus.OK)
  leave(@Param('id') eventId: string, @CurrentUser() user: JwtUser) {
    return this.eventService.leave(eventId, user.id);
  }
}
