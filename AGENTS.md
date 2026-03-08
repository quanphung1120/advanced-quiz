# AGENTS.md

This file is for agentic coding tools working in `advanced-quiz`.

## Current Repository Shape

- Package manager: `bun@1.3.10`
- Monorepo tool: Turborepo via `turbo.json`
- Workspace layout: `apps/*` and `packages/*`
- Primary active apps:
  - `apps/api-new`: Bun + Fastify + Prisma + JWT/cookie auth
  - `apps/web-new`: Vite + React 19 + React Router + React Query + Tailwind 4
- Shared packages:
  - `packages/db`: shared Prisma schema, migrations, and generated client
  - `packages/config`: env parsing and config helpers
  - `packages/contracts`: shared Zod DTOs and API schemas

## Rule Files Scan

- No `.cursorrules` file found.
- No files under `.cursor/rules/` found.
- No `.github/copilot-instructions.md` found.
- There are currently no repository-specific Cursor/Copilot rule files to merge into this guide.

## Setup Commands

- Install dependencies from repo root: `bun install`
- Create local env file from root: `cp .env.example .env`
- Start local development stack from root: `bun run dev`
- Start only the new API from root: `bun run dev:api`
- Start only the new web app from root: `bun run dev:web`
- Start Docker-based local stack from root: `docker compose up`
- Stop Docker-based local stack: `docker compose down`
- Drop Docker volumes too: `docker compose down -v`

## Build Commands

- Build all configured workspaces from root: `bun run build`
- Build only the new API from root: `turbo run build --filter=@advanced-quiz/api`
- Build only the new web app from root: `turbo run build --filter=@advanced-quiz/web`
- Prepare Prisma client from root: `bun run db:generate`
- Build only shared config package from root: `turbo run check-types --filter=@advanced-quiz/config`
- Build API directly inside `apps/api-new`: `bun run build`
- Build web directly inside `apps/web-new`: `bun run build`

## Lint Commands

- Lint all workspaces that expose a lint script: `bun run lint`
- Lint only the new web app from root: `turbo run lint --filter=@advanced-quiz/web`
- Lint directly inside `apps/web-new`: `bun run lint`
- Important: `apps/api-new`, `packages/config`, and `packages/contracts` currently do not expose a `lint` script.

## Typecheck Commands

- Typecheck all configured workspaces from root: `bun run check-types`
- Typecheck only the new API from root: `turbo run check-types --filter=@advanced-quiz/api`
- Typecheck only the new web app from root: `turbo run check-types --filter=@advanced-quiz/web`
- Typecheck only contracts package from root: `turbo run check-types --filter=@advanced-quiz/contracts`
- Typecheck only db package from root: `turbo run check-types --filter=@advanced-quiz/db`
- Typecheck directly inside `apps/api-new`: `bun run check-types`
- Typecheck directly inside `apps/web-new`: `bun run check-types`

## Database Commands

- Generate Prisma client from root: `bun run db:generate`
- Run Prisma development migrations from root: `bun run db:migrate`
- Run Prisma deploy migrations from root: `bun run db:deploy`
- Push Prisma schema to DB from root: `bun run db:push`
- Open Prisma Studio from root: `bun run db:studio`
- Generate Prisma client directly inside `packages/db`: `bun run db:generate`
- Run Prisma development migrations directly inside `packages/db`: `bun run db:migrate`
- With Docker running, sync schema via compose: `docker compose exec api bun run db:push`

## Test Status

- There is no automated test runner configured at the repo root.
- No `test` script was found in the root `package.json`.
- No active Vitest, Jest, Playwright, or Bun test config was found for the current workspaces.
- No meaningful test files were found in the active `api-new`, `web-new`, `config`, `contracts`, or `ui` packages.
- As of this scan, there is no supported "run a single test" command because no test harness is wired up.

## Single-Test Guidance

- If a task asks you to run one test, first verify whether that task also added a test runner.
- If no runner was added, state clearly that the repo currently has no single-test command.
- If you add Vitest to a package, prefer a script that supports file targeting, for example: `bunx vitest run src/path/to/file.test.ts`
- If you add Bun tests to a package, prefer file targeting such as: `bun test src/path/to/file.test.ts`
- If you add Playwright later, prefer a file-scoped run such as: `bunx playwright test tests/example.spec.ts`
- Do not invent a test command in status updates; say that tests are not configured yet.

## Manual Verification Shortcuts

- API health endpoint: `GET http://localhost:3001/health`
- Web dev server: `http://localhost:5173`
- API dev server: `http://localhost:3001`
- Swagger support is wired through Fastify plugins; confirm docs availability based on env and plugin behavior.
- Auth in dev expects cookie-based requests from the web origin.

## Environment Notes

- Root `.env.example` is the main template for local development.
- `apps/api-new/.env.example` and `apps/web-new/.env.example` mirror app-specific subsets.
- Important variables include `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `API_URL`, `WEB_URL`, `CORS_ORIGIN`, `PORT`, and `VITE_API_URL`.
- New env validation belongs in `packages/config` using Zod schemas.
- Prefer typed env access over ad hoc string handling when adding new configuration.

## Code Style: General

- Use TypeScript for active application code.
- Respect strict typing; active tsconfigs enable `strict` mode.
- Prefer small named exports over default exports unless framework conventions require default exports.
- Prefer `const` over `let` unless mutation is necessary.
- Keep functions focused and side effects explicit.
- Keep comments sparse; add them only when a block is non-obvious.

## Code Style: Formatting

- Follow existing Prettier formatting from the root `format` script.
- Use double quotes in TS/TSX unless a file already follows a different local convention.
- Keep semicolons.
- Keep trailing commas where Prettier inserts them.
- Do not hand-align code or build decorative formatting.
- Favor short blocks and early returns over deeply nested conditionals.

## Code Style: Imports

- Keep imports grouped in this order: external packages, shared/internal modules, then relative local modules.
- Use `import type` for type-only imports when possible.
- In `apps/web-new`, prefer the `@/` alias for `src` imports.
- In `apps/api-new` and shared packages, relative imports are the current norm.
- Prefer named imports over namespace imports unless a library pattern requires otherwise.
- Avoid unused imports; `web-new` tsconfig enables unused checks.

## Code Style: Types and Schemas

- Define reusable request/response contracts with Zod in `packages/contracts`.
- Infer TS types from Zod schemas with `z.infer` instead of duplicating shapes.
- Extend env schemas in `packages/config` when introducing new variables.
- Avoid `any`; replace it with exact object shapes, generics, or inferred schema types.
- Model nullable values explicitly with `null` or `undefined` as required by the existing API.
- Keep exported interfaces and types descriptive and domain-based.

## Code Style: Naming

- Use `PascalCase` for React components, types, and interfaces.
- Use `camelCase` for variables, functions, hooks, helpers, and object keys.
- Prefix hooks with `use`.
- Use `UPPER_SNAKE_CASE` for env-backed constants such as `PORT`.
- Use kebab-case file names in the Vite app, especially for route, component, and feature files.
- Keep API route modules named by resource, typically with `index.ts` inside a folder.

## Code Style: React and Frontend

- Use function components and hooks.
- Use React Query for server state and cache invalidation.
- Keep API calls in feature-local `api/*` modules and data hooks in `hooks/*` modules.
- Keep route composition in dedicated route files rather than spreading it across unrelated modules.
- Reuse shared utility helpers like `cn` from `src/lib/utils.ts` for class merging.
- Match existing Tailwind 4 patterns and CSS variable usage in `apps/web-new/src/globals.css`.

## Code Style: API and Backend

- Register Fastify plugins near app startup and keep route registration explicit.
- Export route registration functions such as `collectionRoutes`, `reviewRoutes`, and `healthRoutes`.
- Add Fastify `schema` metadata for params, query, body, and response shapes whenever you add routes.
- Keep auth checks in `preHandler` via `authenticate` for protected endpoints.
- Prefer shared DB helpers from `src/lib/db` over inline raw SQL.
- Return HTTP status codes intentionally with `reply.code(...).send(...)` when not using implicit `200` responses.

## Error Handling

- Fail fast on startup errors; the API entrypoint currently logs and exits on fatal boot failure.
- In API handlers, return structured error objects with `statusCode`, `error`, and `message`.
- Use 401 for unauthenticated access, 403 for forbidden access, and 404 when a resource is missing or inaccessible by design.
- In React forms, surface user-friendly error messages and always clear loading state in `finally` blocks.
- Do not silently swallow errors unless the code intentionally treats the failure as optional, such as session resolution.
- Preserve auth redirect behavior in the shared Axios client when working on web auth flows.

## Agent Workflow Recommendations

- Read the nearest package `package.json` before assuming a command exists.
- Prefer root Turborepo commands when changes span multiple workspaces.
- Prefer package-local commands when working in a single app or package.
- Run `bun run check-types` after TypeScript-heavy changes.
- Run `bun run lint` when editing `apps/web-new`.
- If you add tests in the future, update this file with both full-suite and single-test commands.
