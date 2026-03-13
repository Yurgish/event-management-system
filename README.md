# Event Management System

PoC Event Management application built with:

- Frontend: React + TypeScript + Vite
- Backend: NestJS + Prisma + JWT auth
- Database: PostgreSQL
- Containerization: Docker + Docker Compose

## Project Structure

- `frontend/` — React client app
- `backend/` — NestJS API + Prisma schema/migrations
- `docker-compose.yml` — full stack (frontend + backend + db + pgAdmin)
- `docker-compose.dev.yml` — dev infrastructure only (db + pgAdmin)

## Quick Start — Full Docker Stack

> Requires: [Docker Desktop](https://www.docker.com/products/docker-desktop)

1. Clone the repository:

```bash
git clone https://github.com/your-username/event-management-system.git
cd event-management-system
```

2. Copy environment file:

Windows (PowerShell):

```powershell
Copy-Item backend\.env.example backend\.env
```

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

3. Start everything:

```bash
docker compose up
```

That's it! This starts: PostgreSQL + pgAdmin + Backend API + Frontend — all in containers. Also seeded DB!

Stop:

```bash
docker compose down
```

## Service URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger docs: http://localhost:3000/docs
- pgAdmin: http://localhost:5050

## Default Credentials

These defaults come from `backend/.env.example`.

- pgAdmin email: `admin@admin.com`
- pgAdmin password: `admin`
- PostgreSQL user: `postgres`
- PostgreSQL password: `postgres`
- PostgreSQL database: `event_management`

### pgAdmin Server Connection

If pgAdmin asks you to register a server manually, use:

- Host: `postgres`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`

## Seed Data

Seed creates demo users/events/participants for quick testing.

- In Docker full stack, seed runs automatically on backend start because `RUN_DB_SEED=true`.
- Seed is safe to re-run (users/events use upsert, participant links are reset for seeded events).

Run seed manually from project root:

```bash
npm run db:seed
```

Example seeded users:

- `olena@techevents.dev` / `123123`
- `max@techevents.dev` / `123123`

Note: all seeded users share the same default password: `123123`.

## Dev Mode

> Requires: Node.js 20+, Docker Desktop

1. Clone and install dependencies:

```bash
git clone https://github.com/your-username/event-management-system.git
cd event-management-system
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. Copy environment file:

Windows (PowerShell):

```powershell
Copy-Item backend\.env.example backend\.env
```

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

3. Generate Prisma client:

```bash
cd backend
npx prisma generate
cd ..
```

4. Start dev mode:

```bash
npm run dev
```

This starts: PostgreSQL + pgAdmin in Docker, backend and frontend locally with hot reload.

Stop dev infrastructure:

```bash
npm run dev:down
```

## Useful Commands

### Root (from project folder)

```bash
# Start local dev: DB in Docker + backend/frontend with hot reload
npm run dev

# Start only DB + pgAdmin for local development
npm run dev:db

# Stop DB + pgAdmin started by dev:db
npm run dev:down

# Start full Docker stack
npm run stack:start

# Rebuild and start full Docker stack
npm run stack:up

# Stop full Docker stack
npm run stack:down

# Seed database
npm run db:seed
```

### Backend

```bash
# Start backend in watch mode
npm --prefix backend run start:dev

# Build backend
npm --prefix backend run build

# Lint backend and auto-fix
npm --prefix backend run lint

# Seed (build + execute seed script)
npm --prefix backend run db:seed
```

### Frontend

```bash
# Start Vite dev server
npm --prefix frontend run dev

# Build frontend
npm --prefix frontend run build

# Lint frontend
npm --prefix frontend run lint

# Lint frontend and auto-fix
npm --prefix frontend run lint:fix

# Format frontend files
npm --prefix frontend run format

# Generate API types from Swagger
npm --prefix frontend run types:generate
```
