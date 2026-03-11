# Event Management System

PoC Event Management application built with:

- Frontend: React + TypeScript + Vite
- Backend: NestJS + Prisma + JWT auth
- Database: PostgreSQL
- Containerization: Docker + Docker Compose

## Project Structure

- `frontend/` React client app
- `backend/` NestJS API + Prisma schema/migrations
- `docker-compose.yml` full stack (frontend + backend + db + pgAdmin)
- `docker-compose.dev.yml` dev infrastructure only (db + pgAdmin)

## Quick Start — Full Docker Stack

Copy env, then start everything in one command. No Node.js installation needed.

Windows (PowerShell):

```powershell
copy backend\.env.example backend\.env
docker compose up
```

macOS/Linux:

```bash
cp backend/.env.example backend/.env
docker compose up -d
```

Stop:

```bash
docker compose down
```

This starts: Postgres + pgAdmin + Backend API + Frontend app — all in containers.

## Dev Mode

For local development (hot reload, debugger, etc.) you need to install dependencies first.

1. Install dependencies:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. Start dev mode (DB in Docker, app runs locally):

```bash
npm run dev
```

Stop dev infrastructure:

```bash
npm run dev:down
```

This starts: Postgres + pgAdmin in Docker, backend and frontend as local processes with watch mode.

## Useful Scripts (root)

- `npm run dev` start dev mode (db in Docker, app local)
- `npm run dev:down` stop dev infrastructure
- `npm run stack:start` start full stack (`docker compose up`)
- `npm run stack:up` start full stack with forced rebuild (`docker compose up --build`)
- `npm run stack:down` stop full stack

## Service URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- pgAdmin: http://localhost:5050
- PostgreSQL: localhost:5432

## Troubleshooting

- Port already in use:
  stop conflicting process or change ports in compose/env.
- Backend cannot connect to DB:
  verify `backend/.env` exists and Postgres container is healthy.
- After Dockerfile/dependency changes not reflected:
  run `npm run stack:up` to rebuild images.
- Dev mode fails on first run:
  ensure dependencies are installed in both `backend` and `frontend`.
