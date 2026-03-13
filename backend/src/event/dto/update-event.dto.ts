import { PartialType } from '@nestjs/swagger';

import { CreateEventDto } from '@/event/dto/create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
