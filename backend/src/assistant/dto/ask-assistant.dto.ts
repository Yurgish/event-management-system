import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AskAssistantDto {
  @ApiProperty({
    example: 'What events am I attending this week?',
    maxLength: 500,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  question: string;
}

export class AskAssistantResponseDto {
  @ApiProperty({
    example:
      'You have 3 events this week. Your next one is NestJS in Production Workshop on Friday at 18:00.',
  })
  answer: string;
}
