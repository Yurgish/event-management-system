import assert from 'node:assert/strict';

import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import { Prisma, PrismaClient, type User } from '../generated/prisma/client';

dotenvExpand.expand(dotenv.config());

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
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

type UsersByEmail = Record<string, User>;

type SeedUserInput = Pick<Prisma.UserCreateInput, 'name' | 'email'>;

type SeedEventCreateInput = Pick<
  Prisma.EventUncheckedCreateInput,
  | 'id'
  | 'title'
  | 'description'
  | 'dateTime'
  | 'location'
  | 'capacity'
  | 'isPublic'
> & {
  id: string;
};

interface SeedEventInput extends SeedEventCreateInput {
  organizerEmail: User['email'];
  participantEmails: Array<User['email']>;
}

function daysFromNow(days: number, hours = 18): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date;
}

function getSeedUsers(): SeedUserInput[] {
  return [
    { name: 'Olena Koval', email: 'olena@techevents.dev' },
    { name: 'Max Tymoshenko', email: 'max@techevents.dev' },
    { name: 'Iryna Bondar', email: 'iryna@techevents.dev' },
    { name: 'Denys Melnyk', email: 'denys@techevents.dev' },
  ];
}

function getSeedEvents(): SeedEventInput[] {
  return [
    {
      id: 'seed-event-typescript-meetup',
      title: 'Kyiv TypeScript Meetup: Type-Safe APIs',
      description:
        'Hands-on meetup about end-to-end TypeScript safety with examples from real production projects.',
      dateTime: daysFromNow(5, 19),
      location: 'Kyiv Tech Hub',
      capacity: 80,
      isPublic: true,
      organizerEmail: 'olena@techevents.dev',
      participantEmails: ['max@techevents.dev', 'iryna@techevents.dev'],
    },
    {
      id: 'seed-event-nestjs-workshop',
      title: 'NestJS in Production Workshop',
      description:
        'Deep-dive workshop on architecture patterns, modules, testing, and performance for NestJS services.',
      dateTime: daysFromNow(8, 18),
      location: 'Lviv IT Cluster Space',
      capacity: 45,
      isPublic: true,
      organizerEmail: 'max@techevents.dev',
      participantEmails: ['olena@techevents.dev', 'denys@techevents.dev'],
    },
    {
      id: 'seed-event-prisma-clinic',
      title: 'Prisma + PostgreSQL Performance Clinic',
      description:
        'Session focused on indexing, query optimization, transactions, and schema evolution for high-load apps.',
      dateTime: daysFromNow(12, 17),
      location: 'Dnipro DataLab',
      capacity: 40,
      isPublic: true,
      organizerEmail: 'iryna@techevents.dev',
      participantEmails: ['max@techevents.dev'],
    },
    {
      id: 'seed-event-react-architecture-night',
      title: 'React 19 Frontend Architecture Night',
      description:
        'Talks and demos about scalable React app structure, routing, data layer patterns, and UI consistency.',
      dateTime: daysFromNow(15, 19),
      location: 'Odesa Frontend Community',
      capacity: 100,
      isPublic: true,
      organizerEmail: 'denys@techevents.dev',
      participantEmails: ['olena@techevents.dev', 'iryna@techevents.dev'],
    },
    {
      id: 'seed-event-devops-essentials',
      title: 'DevOps for Developers: CI/CD Essentials',
      description:
        'Practical event on building reliable pipelines, container workflows, and deployment rollbacks.',
      dateTime: daysFromNow(20, 18),
      location: 'Kharkiv Online Stream',
      capacity: 120,
      isPublic: true,
      organizerEmail: 'olena@techevents.dev',
      participantEmails: ['denys@techevents.dev'],
    },
    {
      id: 'seed-event-system-design-mock-interviews',
      title: 'System Design Mock Interviews for Engineers',
      description:
        'Peer-to-peer mock interviews and feedback session around distributed systems and trade-off analysis.',
      dateTime: daysFromNow(25, 18),
      location: 'Remote (Google Meet)',
      capacity: 60,
      isPublic: true,
      organizerEmail: 'max@techevents.dev',
      participantEmails: ['olena@techevents.dev', 'iryna@techevents.dev'],
    },
  ];
}

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

async function upsertEvents(users: UsersByEmail): Promise<SeedEventInput[]> {
  const eventsInput = getSeedEvents();

  for (const event of eventsInput) {
    const organizer = users[event.organizerEmail];
    assert.ok(organizer, `Organizer not found for ${event.title}`);

    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: {
        id: event.id,
        title: event.title,
        description: event.description,
        dateTime: event.dateTime,
        location: event.location,
        capacity: event.capacity,
        isPublic: event.isPublic,
        organizerId: organizer.id,
      },
    });
  }

  return eventsInput;
}

async function upsertParticipants(
  users: UsersByEmail,
  eventsInput: SeedEventInput[],
): Promise<void> {
  for (const event of eventsInput) {
    for (const email of event.participantEmails) {
      const user = users[email];

      if (!user) {
        continue;
      }

      await prisma.participant.upsert({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: event.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          eventId: event.id,
        },
      });
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
  const eventsInput = await upsertEvents(users);
  await upsertParticipants(users, eventsInput);
  await assertNoSeedDuplicates(users, eventsInput);

  console.log('Seed completed successfully.');
  console.log(`Users seeded: ${Object.keys(users).length}`);
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
