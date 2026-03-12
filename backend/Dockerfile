FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM deps AS builder

COPY prisma ./prisma
COPY nest-cli.json prisma.config.ts tsconfig*.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma.config.ts ./
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 3000
CMD ["sh", "-c", "export DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public && npx prisma migrate deploy && if [ \"$RUN_DB_SEED\" = \"true\" ]; then node dist/prisma/seed.js; fi && node dist/src/main.js"]
