import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({ example: 'cm8xtagtech1234' })
  id: string;

  @ApiProperty({ example: 'technology' })
  slug: string;

  @ApiProperty({ example: 'Technology' })
  label: string;

  @ApiProperty({ example: 'blue' })
  color: string;
}
