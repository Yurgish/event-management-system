import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

const TAG_QUERY_ALIASES: Record<string, string[]> = {
  tech: ['technology'],
  technical: ['technology'],
  it: ['technology'],
  ux: ['ux-ui'],
  ui: ['ux-ui'],
  ml: ['machine-learning'],
  llms: ['llm'],
  node: ['node-js'],
  nodejs: ['node-js'],
  nextjs: ['next-js'],
  reactjs: ['react'],
  vuejs: ['vue'],
  db: ['data'],
  database: ['data'],
};

function normalizeTagQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[._/]+/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b(tags?|events?)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

  async resolveTagQueries(queries: string[]) {
    const normalizedQueries = queries.map(normalizeTagQuery).filter(Boolean);

    if (normalizedQueries.length === 0) {
      return { matchedSlugs: [], matchedTags: [], unresolvedQueries: [] };
    }

    const tags = await this.prisma.tag.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        label: true,
        normalizedLabel: true,
        color: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    const matchedTags = new Map<string, (typeof tags)[number]>();
    const unresolvedQueries: string[] = [];

    for (const query of normalizedQueries) {
      const aliasSlugs = TAG_QUERY_ALIASES[query] ?? [];
      const slugifiedQuery = query.replace(/\s+/g, '-');

      const directMatches = tags.filter((tag) => {
        const normalizedSlug = normalizeTagQuery(tag.slug);
        const normalizedLabel = normalizeTagQuery(tag.label);
        const storedNormalizedLabel = normalizeTagQuery(tag.normalizedLabel);

        return (
          normalizedSlug === query ||
          normalizedSlug === slugifiedQuery ||
          normalizedLabel === query ||
          storedNormalizedLabel === query ||
          normalizedSlug.includes(query) ||
          normalizedLabel.includes(query) ||
          query.includes(normalizedSlug)
        );
      });

      const aliasMatches = tags.filter((tag) => aliasSlugs.includes(tag.slug));
      const resolved = [...directMatches, ...aliasMatches];

      if (resolved.length === 0) {
        unresolvedQueries.push(query);
        continue;
      }

      for (const tag of resolved) {
        matchedTags.set(tag.slug, tag);
      }
    }

    return {
      matchedSlugs: [...matchedTags.keys()],
      matchedTags: [...matchedTags.values()].map((tag) => ({
        id: tag.id,
        slug: tag.slug,
        label: tag.label,
        color: tag.color,
      })),
      unresolvedQueries,
    };
  }
}
