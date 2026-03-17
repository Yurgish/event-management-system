import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { FALLBACK_MESSAGE } from '@/assistant/assistant.prompts';
import { AssistantService } from '@/assistant/assistant.service';
import { AskAssistantDto } from '@/assistant/dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtUser } from '@/common/jwt.types';

@ApiTags('Assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask AI assistant (streaming text response)' })
  @HttpCode(HttpStatus.OK)
  async askStream(
    @CurrentUser() user: JwtUser,
    @Body() dto: AskAssistantDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.assistantService.askStream(
        user.id,
        dto.question,
      );
      result.pipeUIMessageStreamToResponse(res);
    } catch {
      res.status(500).send(FALLBACK_MESSAGE);
    }
  }
}
