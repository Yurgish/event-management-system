import { Controller, Get, NotFoundException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtUser } from '@/common/jwt.types';
import { MyEventsResponseDto, UserResponseDto } from '@/user/dto';
import { UserService } from '@/user/user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getMe(@CurrentUser() user: JwtUser) {
    const found = await this.userService.findMe(user.id);
    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  @Get('me/events')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user events (organized + joined) for calendar',
  })
  @ApiOkResponse({
    description: 'Object with organizedEvents and participations arrays.',
    type: MyEventsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  myEvents(@CurrentUser() user: JwtUser) {
    return this.userService.findMyEvents(user.id);
  }
}
