import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl =
  rawDatabaseUrl && !rawDatabaseUrl.includes('${')
    ? rawDatabaseUrl
    : `postgresql://${process.env.POSTGRES_USER ?? 'postgres'}:${process.env.POSTGRES_PASSWORD ?? 'postgres'}@${process.env.POSTGRES_HOST ?? 'localhost'}:${process.env.POSTGRES_PORT ?? '5432'}/${process.env.POSTGRES_DB ?? 'event_management'}?schema=public`;

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
