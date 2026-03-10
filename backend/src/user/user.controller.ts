import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtUser } from 'src/common/jwt.types';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me/events')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user events (organized + joined) for calendar',
  })
  @ApiOkResponse({
    description: 'Object with organizedEvents and participations arrays.',
  })
  myEvents(@CurrentUser() user: JwtUser) {
    return this.userService.findMyEvents(user.id);
  }
}
