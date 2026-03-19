import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TagResponseDto } from '@/tags/dto/tag-response.dto';
import { TagsService } from '@/tags/tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active tags' })
  @ApiOkResponse({ type: [TagResponseDto] })
  findAll() {
    return this.tagsService.findAll();
  }
}
