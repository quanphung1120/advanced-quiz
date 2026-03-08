# Advanced Quiz

Local development targets the new Bun/Fastify API in `apps/api-new`, the Vite/React app in `apps/web-new`, and a shared Prisma workspace in `packages/db`.

## Local Dev

1. Create a local env file:

```sh
cp .env.example .env
```

2. Install dependencies:

```sh
bun install
```

3. Start the new apps:

```sh
bun run dev
```

This runs:

- `@advanced-quiz/api` on `http://localhost:3001`
- `@advanced-quiz/web` on `http://localhost:5173`

Prisma is managed from the shared database workspace:

```sh
bun run db:generate
bun run db:migrate
```

## Docker Compose

The repo includes a local development stack in `compose.yaml`.

Start Postgres, the new API, and the new web app:

```sh
docker compose up
```

Services:

- Postgres: `localhost:5432`
- API: `http://localhost:3001`
- Web: `http://localhost:5173`

Stop the stack:

```sh
docker compose down
```

Remove database and dependency volumes too:

```sh
docker compose down -v
```

If you need to sync the schema into a fresh local database:

```sh
docker compose exec api bun run db:push
```
