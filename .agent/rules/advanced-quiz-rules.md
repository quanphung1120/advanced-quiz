---
trigger: model_decision
description: When working on advanced-quiz project
---

# AI Coding Assistant Rules for `advanced-quiz`

## Project Structure & Framework

- **Monorepo Architecture**: This is a Turborepo monorepo with `bun` as the package manager; always run commands from the root using `turbo` or navigate to specific `apps/` or `packages/` directories.
- **Apps Structure**: Contains two primary apps: `apps/api-new` (NestJS/Fastify backend) and `apps/web-new` (Vite/React frontend).
- **Shared Packages**: Shared configurations live in `packages/` (`config`, `contracts`, `ui`).

### NestJS Backend (`apps/api-new`)

- **Framework**: NestJS with Fastify adapter.
- **Database**: Prisma ORM with PostgreSQL.
- **Authentication**: Better Auth with Prisma adapter.
- **Validation**: Zod schemas shared via `@advanced-quiz/contracts`.
- **API Documentation**: Swagger/OpenAPI enabled at `/docs`.

### Vite/React Frontend (`apps/web-new`)

- **Framework**: Vite with React 19 and React Router 7.
- **State Management**: Tanstack React Query for server state.
- **Styling**: Tailwind CSS 4 with `@tailwindcss/vite`.
- **Form Handling**: `react-hook-form` with `zod` resolvers.
- **Component Library**: Base UI and Lucide React icons.
- **API Client**: Axios instance configured in `src/lib/api-client.ts`.

## Development Workflow

- **Setup**: Run `bun install` at the root.
- **Dev Server**: Run `bun run dev` from root to start both apps.
- **Type Checking**: Run `bun run check-types` for all workspaces.
- **Linting**: Run `bun run lint` (primarily for web and UI packages).
- **Database**: Use `bun run db:push` or `bun run db:migrate` to sync schema.
