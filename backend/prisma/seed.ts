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
    { name: 'Viktor Ostapenko', email: 'viktor@techevents.dev' },
    { name: 'Anna Kravchenko', email: 'anna@techevents.dev' },
    { name: 'Dmytro Savchenko', email: 'dmytro@techevents.dev' },
    { name: 'Sofiia Rudenko', email: 'sofiia@techevents.dev' },
    { name: 'Andriy Petrenko', email: 'andriy@techevents.dev' },
    { name: 'Natalia Hrytsenko', email: 'natalia@techevents.dev' },
    { name: 'Bohdan Marchenko', email: 'bohdan@techevents.dev' },
    { name: 'Larysa Fedorenko', email: 'larysa@techevents.dev' },
    { name: 'Kostiantyn Shevchenko', email: 'kostiantyn@techevents.dev' },
    { name: 'Oksana Tkachenko', email: 'oksana@techevents.dev' },
    { name: 'Taras Kovalenko', email: 'taras@techevents.dev' },
    { name: 'Halyna Moroz', email: 'halyna@techevents.dev' },
    { name: 'Yuriy Polishchuk', email: 'yuriy@techevents.dev' },
    { name: 'Tetiana Karpenko', email: 'tetiana@techevents.dev' },
    { name: 'Mykola Sydorenko', email: 'mykola@techevents.dev' },
    { name: 'Olha Zubko', email: 'olha@techevents.dev' },
    { name: 'Serhiy Pavlenko', email: 'serhiy@techevents.dev' },
    { name: 'Dariya Kuznetsova', email: 'dariya@techevents.dev' },
    { name: 'Roman Volkov', email: 'roman@techevents.dev' },
    { name: 'Valentyna Kozak', email: 'valentyna@techevents.dev' },
    { name: 'Vasyl Stetsenko', email: 'vasyl@techevents.dev' },
    { name: 'Zhanna Prokopenko', email: 'zhanna@techevents.dev' },
    { name: 'Fedir Lysenko', email: 'fedir@techevents.dev' },
    { name: 'Milena Boychuk', email: 'milena@techevents.dev' },
    { name: 'Yaroslav Kharchenko', email: 'yaroslav@techevents.dev' },
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
      capacity: 2,
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
      participantEmails: [
        'olena@techevents.dev',
        'denys@techevents.dev',
        'iryna@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'bohdan@techevents.dev',
      ],
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
      participantEmails: [
        'max@techevents.dev',
        'olena@techevents.dev',
        'viktor@techevents.dev',
      ],
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
      participantEmails: [
        'olena@techevents.dev',
        'iryna@techevents.dev',
        'max@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'bohdan@techevents.dev',
        'larysa@techevents.dev',
        'kostiantyn@techevents.dev',
        'oksana@techevents.dev',
        'taras@techevents.dev',
        'halyna@techevents.dev',
        'yuriy@techevents.dev',
        'tetiana@techevents.dev',
        'mykola@techevents.dev',
        'olha@techevents.dev',
        'serhiy@techevents.dev',
        'dariya@techevents.dev',
        'roman@techevents.dev',
      ],
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
      participantEmails: [],
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
    {
      id: 'seed-event-kubernetes-basics-lab',
      title: 'Kubernetes Basics Lab for Backend Teams',
      description:
        'Guided lab for deploying backend services to Kubernetes, configuring health checks, and rolling updates.',
      dateTime: daysFromNow(28, 18),
      location: 'Kyiv Cloud Space',
      capacity: 50,
      isPublic: true,
      organizerEmail: 'denys@techevents.dev',
      participantEmails: [],
    },
    {
      id: 'seed-event-graphql-api-design',
      title: 'GraphQL API Design Session',
      description:
        'Best practices for schema design, resolver performance, and authorization in GraphQL APIs.',
      dateTime: daysFromNow(30, 19),
      location: 'Lviv Dev Center',
      capacity: 70,
      isPublic: true,
      organizerEmail: 'olena@techevents.dev',
      participantEmails: [
        'denys@techevents.dev',
        'max@techevents.dev',
        'iryna@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'bohdan@techevents.dev',
      ],
    },
    {
      id: 'seed-event-frontend-testing-react',
      title: 'Frontend Testing in React: RTL + Vitest',
      description:
        'Practical workshop on reliable component and integration testing with modern frontend tooling.',
      dateTime: daysFromNow(33, 18),
      location: 'Odesa JS Meetup',
      capacity: 65,
      isPublic: true,
      organizerEmail: 'iryna@techevents.dev',
      participantEmails: [
        'olena@techevents.dev',
        'max@techevents.dev',
        'dmytro@techevents.dev',
      ],
    },
    {
      id: 'seed-event-highload-postgres-indexing',
      title: 'Highload PostgreSQL Indexing Strategies',
      description:
        'Deep dive into query plans, indexes, and practical tuning for large-scale transactional systems.',
      dateTime: daysFromNow(36, 17),
      location: 'Dnipro Data Community',
      capacity: 55,
      isPublic: true,
      organizerEmail: 'max@techevents.dev',
      participantEmails: [
        'olena@techevents.dev',
        'iryna@techevents.dev',
        'denys@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'bohdan@techevents.dev',
        'larysa@techevents.dev',
        'kostiantyn@techevents.dev',
        'oksana@techevents.dev',
        'taras@techevents.dev',
        'halyna@techevents.dev',
        'yuriy@techevents.dev',
        'tetiana@techevents.dev',
        'mykola@techevents.dev',
        'olha@techevents.dev',
        'serhiy@techevents.dev',
      ],
    },
    {
      id: 'seed-event-ai-assistants-in-dev-workflow',
      title: 'AI Assistants in Daily Dev Workflow',
      description:
        'How engineering teams use AI tools for planning, coding, review, and documentation safely.',
      dateTime: daysFromNow(39, 19),
      location: 'Remote (Zoom)',
      capacity: 200,
      isPublic: true,
      organizerEmail: 'olena@techevents.dev',
      participantEmails: [],
    },
    {
      id: 'seed-event-mobile-ci-cd-pipelines',
      title: 'Mobile CI/CD Pipelines with Fastlane',
      description:
        'Workshop on release automation for iOS and Android apps with signing, stores, and QA gates.',
      dateTime: daysFromNow(42, 18),
      location: 'Kharkiv Mobile Guild',
      capacity: 45,
      isPublic: true,
      organizerEmail: 'denys@techevents.dev',
      participantEmails: [
        'olena@techevents.dev',
        'max@techevents.dev',
        'iryna@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'larysa@techevents.dev',
      ],
    },
    {
      id: 'seed-event-observability-with-opentelemetry',
      title: 'Observability with OpenTelemetry',
      description:
        'Tracing, metrics, and logs end-to-end for microservices with practical OpenTelemetry setup.',
      dateTime: daysFromNow(45, 18),
      location: 'Kyiv SRE Hub',
      capacity: 85,
      isPublic: true,
      organizerEmail: 'max@techevents.dev',
      participantEmails: [
        'olena@techevents.dev',
        'iryna@techevents.dev',
        'denys@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'larysa@techevents.dev',
      ],
    },
    {
      id: 'seed-event-security-jwt-and-cookies',
      title: 'Security Clinic: JWT, Cookies, and Sessions',
      description:
        'Hands-on review of auth flows, token refresh patterns, and web security hardening techniques.',
      dateTime: daysFromNow(48, 19),
      location: 'Lviv Security Meetup',
      capacity: 75,
      isPublic: true,
      organizerEmail: 'iryna@techevents.dev',
      participantEmails: ['olena@techevents.dev', 'max@techevents.dev'],
    },
    {
      id: 'seed-event-python-data-engineering-intro',
      title: 'Intro to Python Data Engineering Pipelines',
      description:
        'Building robust ETL jobs with scheduling, validation, and monitoring for analytics teams.',
      dateTime: daysFromNow(51, 17),
      location: 'Remote (Google Meet)',
      capacity: 90,
      isPublic: true,
      organizerEmail: 'olena@techevents.dev',
      participantEmails: [],
    },
    {
      id: 'seed-event-nodejs-performance-profiling',
      title: 'Node.js Performance Profiling Workshop',
      description:
        'Profiling CPU, memory, and event-loop bottlenecks in Node.js services and applying fixes.',
      dateTime: daysFromNow(54, 18),
      location: 'Kyiv Backend Club',
      capacity: 60,
      isPublic: true,
      organizerEmail: 'max@techevents.dev',
      participantEmails: [
        'olena@techevents.dev',
        'iryna@techevents.dev',
        'denys@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'bohdan@techevents.dev',
        'larysa@techevents.dev',
        'kostiantyn@techevents.dev',
        'oksana@techevents.dev',
        'taras@techevents.dev',
        'halyna@techevents.dev',
        'yuriy@techevents.dev',
        'tetiana@techevents.dev',
        'mykola@techevents.dev',
        'olha@techevents.dev',
        'roman@techevents.dev',
        'vasyl@techevents.dev',
        'zhanna@techevents.dev',
      ],
    },
    {
      id: 'seed-event-microfrontends-architecture',
      title: 'Microfrontends Architecture Meetup',
      description:
        'Patterns, trade-offs, and deployment strategies for independent frontend teams at scale.',
      dateTime: daysFromNow(57, 19),
      location: 'Odesa Frontend Hub',
      capacity: 100,
      isPublic: true,
      organizerEmail: 'denys@techevents.dev',
      participantEmails: [
        'max@techevents.dev',
        'iryna@techevents.dev',
        'sofiia@techevents.dev',
      ],
    },
    {
      id: 'seed-event-go-concurrency-patterns',
      title: 'Go Concurrency Patterns in Practice',
      description:
        'Learn practical goroutine, channel, and worker-pool patterns for backend engineering tasks.',
      dateTime: daysFromNow(60, 18),
      location: 'Dnipro Golang Community',
      capacity: 50,
      isPublic: true,
      organizerEmail: 'iryna@techevents.dev',
      participantEmails: [],
    },
    {
      id: 'seed-event-product-analytics-for-engineers',
      title: 'Product Analytics for Engineers',
      description:
        'Designing events, funnels, and dashboards that help teams make better product decisions.',
      dateTime: daysFromNow(63, 18),
      location: 'Remote (Zoom)',
      capacity: 140,
      isPublic: true,
      organizerEmail: 'olena@techevents.dev',
      participantEmails: [
        'max@techevents.dev',
        'iryna@techevents.dev',
        'denys@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'bohdan@techevents.dev',
      ],
    },
    {
      id: 'seed-event-event-driven-architecture',
      title: 'Event-Driven Architecture with Kafka',
      description:
        'Building asynchronous systems with Kafka, retries, idempotency, and consumer scaling.',
      dateTime: daysFromNow(66, 19),
      location: 'Kharkiv Streaming Lab',
      capacity: 70,
      isPublic: true,
      organizerEmail: 'max@techevents.dev',
      participantEmails: [
        'olena@techevents.dev',
        'iryna@techevents.dev',
        'denys@techevents.dev',
        'viktor@techevents.dev',
        'anna@techevents.dev',
        'dmytro@techevents.dev',
        'sofiia@techevents.dev',
        'andriy@techevents.dev',
        'natalia@techevents.dev',
        'bohdan@techevents.dev',
        'larysa@techevents.dev',
        'kostiantyn@techevents.dev',
        'oksana@techevents.dev',
        'taras@techevents.dev',
        'halyna@techevents.dev',
        'yuriy@techevents.dev',
        'tetiana@techevents.dev',
        'mykola@techevents.dev',
        'olha@techevents.dev',
        'fedir@techevents.dev',
      ],
    },
    {
      id: 'seed-event-cloud-cost-optimization',
      title: 'Cloud Cost Optimization for Startups',
      description:
        'Practical techniques to control infrastructure spending while keeping performance and reliability.',
      dateTime: daysFromNow(70, 18),
      location: 'Kyiv FinOps Meetup',
      capacity: 95,
      isPublic: true,
      organizerEmail: 'denys@techevents.dev',
      participantEmails: [],
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
