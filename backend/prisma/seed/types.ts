import type { PrismaClient, User } from '@generated/prisma/client';

type UserUpsertArgs = Parameters<PrismaClient['user']['upsert']>[0];
type EventUpsertArgs = Parameters<PrismaClient['event']['upsert']>[0];
type TagUpsertArgs = Parameters<PrismaClient['tag']['upsert']>[0];

export type UsersByEmail = Record<string, User>;

export type SeedUserInput = Pick<UserUpsertArgs['create'], 'name' | 'email'>;

export type SeedEventInput = Pick<
  EventUpsertArgs['create'],
  | 'id'
  | 'title'
  | 'description'
  | 'dateTime'
  | 'location'
  | 'capacity'
  | 'isPublic'
> & {
  id: string;
  organizerEmail: User['email'];
  participantEmails: Array<User['email']>;
  tagSlugs: string[];
};

export type TagCatalogItem = Pick<
  TagUpsertArgs['create'],
  'slug' | 'label' | 'color' | 'sortOrder'
>;
