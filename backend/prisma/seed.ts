import assert from 'node:assert/strict';

import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getSeedEvents } from '@prisma-seed/catalogs/events.catalog';
import { TAG_CATALOG } from '@prisma-seed/catalogs/tags.catalog';
import { getSeedUsers } from '@prisma-seed/catalogs/users.catalog';
import type { SeedEventInput, UsersByEmail } from '@prisma-seed/types';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotenv.config());

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('${')) {
    return process.env.DATABASE_URL;
  }

  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
  } = process.env;

  assert.ok(POSTGRES_USER, 'POSTGRES_USER is required for seed');
  assert.ok(POSTGRES_PASSWORD, 'POSTGRES_PASSWORD is required for seed');
  assert.ok(POSTGRES_HOST, 'POSTGRES_HOST is required for seed');
  assert.ok(POSTGRES_PORT, 'POSTGRES_PORT is required for seed');
  assert.ok(POSTGRES_DB, 'POSTGRES_DB is required for seed');

  return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;
}

const databaseUrl = resolveDatabaseUrl();
assert.ok(databaseUrl, 'DATABASE_URL is required for seed');

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = '123123';

async function upsertUsers(): Promise<UsersByEmail> {
  const passwordHash = await hash(DEFAULT_PASSWORD, 10);
  const usersInput = getSeedUsers();
  const users: UsersByEmail = {};

  for (const user of usersInput) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
      },
    });

    users[user.email] = record;
  }

  return users;
}

async function upsertTags(): Promise<number> {
  for (const tag of TAG_CATALOG) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {
        label: tag.label,
        normalizedLabel: tag.label.toLowerCase(),
        color: tag.color,
        sortOrder: tag.sortOrder,
        isActive: true,
      },
      create: {
        slug: tag.slug,
        label: tag.label,
        normalizedLabel: tag.label.toLowerCase(),
        color: tag.color,
        sortOrder: tag.sortOrder,
        isActive: true,
      },
    });
  }

  return TAG_CATALOG.length;
}

async function upsertEvents(users: UsersByEmail): Promise<SeedEventInput[]> {
  const eventsInput = getSeedEvents();

  for (const event of eventsInput) {
    const organizer = users[event.organizerEmail];
    assert.ok(organizer, `Organizer not found for ${event.title}`);

    const tags = await prisma.tag.findMany({
      where: { slug: { in: event.tagSlugs } },
      select: { id: true, slug: true },
    });

    const foundSlugs = tags.map((t) => t.slug);
    const missingSlugs = event.tagSlugs.filter((s) => !foundSlugs.includes(s));
    assert.ok(
      missingSlugs.length === 0,
      `Tags not found for "${event.title}": ${missingSlugs.join(', ')}`,
    );

    await prisma.event.upsert({
      where: { id: event.id },
      update: {
        title: event.title,
        description: event.description,
        dateTime: event.dateTime,
        location: event.location,
        capacity: event.capacity,
        isPublic: event.isPublic,
        organizerId: organizer.id,
        tags: {
          deleteMany: {},
          create: tags.map((tag) => ({ tagId: tag.id })),
        },
      },
      create: {
        id: event.id,
        title: event.title,
        description: event.description,
        dateTime: event.dateTime,
        location: event.location,
        capacity: event.capacity,
        isPublic: event.isPublic,
        organizerId: organizer.id,
        tags: {
          create: tags.map((tag) => ({ tagId: tag.id })),
        },
      },
    });
  }

  return eventsInput;
}

async function upsertParticipants(
  users: UsersByEmail,
  eventsInput: SeedEventInput[],
): Promise<void> {
  const seedEventIds = eventsInput.map((e) => e.id);

  // Reset participants for seed events on every run so counts stay in sync with seed config.
  await prisma.participant.deleteMany({
    where: { eventId: { in: seedEventIds } },
  });

  for (const event of eventsInput) {
    const participantData = event.participantEmails
      .filter((email) => Boolean(users[email]))
      .map((email) => ({ userId: users[email].id, eventId: event.id }));

    if (participantData.length > 0) {
      await prisma.participant.createMany({ data: participantData });
    }
  }
}

async function assertNoSeedDuplicates(
  users: UsersByEmail,
  eventsInput: SeedEventInput[],
): Promise<void> {
  for (const event of eventsInput) {
    const organizer = users[event.organizerEmail];
    assert.ok(organizer, `Organizer not found for ${event.title}`);

    const duplicatesByTitleAndOrganizer = await prisma.event.count({
      where: {
        title: event.title,
        organizerId: organizer.id,
      },
    });

    assert.equal(
      duplicatesByTitleAndOrganizer,
      1,
      `Duplicate seeded event found for "${event.title}"`,
    );
  }
}

async function main(): Promise<void> {
  const users = await upsertUsers();
  const tagsCount = await upsertTags();
  const eventsInput = await upsertEvents(users);
  await upsertParticipants(users, eventsInput);
  await assertNoSeedDuplicates(users, eventsInput);

  console.log('Seed completed successfully.');
  console.log(`Users seeded: ${Object.keys(users).length}`);
  console.log(`Tags seeded: ${tagsCount}`);
  console.log(`Events seeded: ${eventsInput.length}`);
  console.log(`Default password for seeded users: ${DEFAULT_PASSWORD}`);
}

void main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
