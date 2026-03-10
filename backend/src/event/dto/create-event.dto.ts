import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'NestJS Workshop' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'A deep dive into NestJS framework' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-06-15T14:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  dateTime: string;

  @ApiProperty({ example: 'Kyiv, Ukraine' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 50, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
