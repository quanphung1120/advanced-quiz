# ExecPlans
When writing complex features or significant refactors, use an ExecPlan (as described in .agent/PLANS.md) from design to implementation.

# Repository Guidelines

## Project Structure & Module Organization
This monorepo uses Turborepo with `apps/*` and `packages/*` workspaces. Main applications live in `apps/api-new` (NestJS on Fastify) and `apps/web-new` (Vite + React). Shared code lives in `packages/contracts` and `packages/db`; keep cross-app types and database logic there instead of duplicating them in app folders. Runtime config should stay dedicated to each app under that app's `src/config` area. Source files are under each workspace’s `src/`. Frontend static assets live in `apps/web-new/public`. Drizzle schema and migration artifacts live under `packages/db`.

## Build, Test, and Development Commands
Run commands from the repo root with `pnpm`.

- `pnpm install`: install workspace dependencies.
- `pnpm run dev`: start API and web together via Turbo.
- `pnpm run dev:api` / `pnpm run dev:web`: run one app only.
- `pnpm run build`: build all workspaces.
- `pnpm run lint`: run configured lint tasks; currently relevant for `apps/web-new`.
- `pnpm run check-types`: run TypeScript checks across workspaces.
- `pnpm run db:generate`, `pnpm run db:migrate`, `pnpm run db:push`, `pnpm run db:studio`: manage Drizzle schema and database workflows.

## Coding Style & Naming Conventions
Use TypeScript with ES modules and 2-space indentation. Format with `pnpm run format` and follow the existing ESLint setup in `apps/web-new`. Prefer explicit imports. Use `PascalCase` for React components and types, `camelCase` for functions and variables, and `kebab-case` for file names such as `sign-in-page.tsx` or `auth.service.ts`.

## Testing Guidelines
There is no dedicated automated test suite yet. Minimum verification for code changes is `pnpm run check-types`, `pnpm run lint`, and a manual smoke test of the affected API and web flows. For significant UI, layout, routing, or cross-workspace workflow changes, also run the relevant development startup command from the repo root (`pnpm run dev`, or `pnpm run dev:web` / `pnpm run dev:api` when only one surface is affected) and confirm the affected app boots cleanly before closing the task. When adding tests, place them near the source file using `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Use Conventional Commits, as in `feat(db): add quiz attempt schema` or `fix(web): handle expired session`. Keep commits focused. PRs should include a short summary, impacted workspaces, environment or migration notes, linked issues, and screenshots for UI changes.

## Configuration & Planning Notes
Copy `.env.example` to `.env` before local development. Do not commit secrets. For larger features or refactors, create and follow an ExecPlan in `PLANS.md` / `execplans/` before implementation.
