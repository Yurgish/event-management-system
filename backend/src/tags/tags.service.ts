import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tag.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, label: true, color: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
