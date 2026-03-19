import { Module } from '@nestjs/common';

import { TagsController } from '@/tags/tags.controller';
import { TagsService } from '@/tags/tags.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
