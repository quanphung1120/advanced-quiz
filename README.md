# Advanced Quiz

Local development targets the Fastify API in `apps/api-new`, the Vite/React app in `apps/web-new`, and a shared Prisma workspace in `packages/db`.

## Local Dev

1. Create a local env file:

```sh
cp .env.example .env
```

2. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string (external/local managed by you).

3. Install dependencies:

```sh
pnpm install
```

4. Start the development environment:

```sh
pnpm run dev
```

Before the first API start against a fresh database, run a Prisma migration or schema push for `packages/db`.

If you change the Prisma schema and want to record a migration file in the repo, run:

```sh
pnpm run db:generate
pnpm run db:migrate
```

This runs:

- `@advanced-quiz/api` on `http://localhost:3001`
- `@advanced-quiz/web` on `http://localhost:5173`

Database scripts are managed in `packages/db` via Prisma:

```sh
pnpm run db:generate
pnpm run db:migrate
pnpm run db:push
pnpm run db:studio
```

## Docker Compose (Production)

This repository no longer ships a local development `compose.yaml` with PostgreSQL.

`compose.prod.yaml` builds API/Web images and expects an external PostgreSQL via `DATABASE_URL`.

```sh
export DATABASE_URL='postgresql://user:password@db-host:5432/advanced_quiz'
docker compose -f compose.prod.yaml up --build
```

Stop:

```sh
docker compose -f compose.prod.yaml down
```
