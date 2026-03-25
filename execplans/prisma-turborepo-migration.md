# Migrate Shared Database Package from Drizzle to Prisma in the Turborepo

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is maintained in accordance with [PLANS.md](../PLANS.md) at the repository root.

## Purpose / Big Picture

After this change, the repository will again use Prisma as the only ORM and migration tool. The shared database workspace at `packages/db` will own the Prisma schema, generated client, and database scripts, while the NestJS API in `apps/api-new` will consume that package through a global Prisma-backed service instead of Drizzle query builders.

A contributor can verify the change by running Prisma generation and migration commands from the repo root, then running type-check, lint, and build commands. The observable application behavior must remain the same: auth, collections, flashcards, and review flows still work against PostgreSQL, and the API container still runs pending database migrations before startup.

## Progress

- [x] (2026-03-13 10:41Z) Audited the current Drizzle-based workspace, API service usage, Docker startup command, and Turborepo task wiring.
- [x] (2026-03-13 10:45Z) Reviewed the prior Prisma implementation in git history to recover the previous schema and Nest Prisma module shape.
- [x] (2026-03-13 10:48Z) Created this ExecPlan and fixed the implementation scope: convert `packages/db`, refactor `apps/api-new`, preserve external API behavior, and allow Prisma to become the new migration baseline.
- [x] (2026-03-13 14:10Z) Replaced Drizzle assets in `packages/db` with Prisma schema, Prisma config, generated client exports, and Prisma CLI scripts.
- [x] (2026-03-13 14:13Z) Refactored Nest database integration plus `users`, `auth`, `collections`, and serialization helpers from Drizzle to Prisma.
- [x] (2026-03-13 14:18Z) Added a checked-in Prisma migration baseline and updated runtime/docs references from Drizzle to Prisma.
- [x] (2026-03-13 14:19Z) Ran validation (`pnpm install --no-frozen-lockfile`, `pnpm run db:generate`, `pnpm run check-types`, `pnpm run lint`, `pnpm run build`).

## Surprises & Discoveries

- Observation: The worktree already contains many unrelated tracked and untracked edits outside the database migration surface.
  Evidence: `git status --short` reports broad changes across `apps/web-new`, config packages, and workspace metadata.

- Observation: The repository previously had a working shared Prisma package and Nest Prisma module before the Drizzle migration.
  Evidence: commit `6ec3541` contains `packages/db/prisma/schema.prisma`, `packages/db/src/client.ts`, and `apps/api-new/src/prisma/*`.

- Observation: The current repository no longer tracks Drizzle SQL migrations; the `packages/db/drizzle` directory is effectively gone in the present worktree.
  Evidence: `find packages/db/drizzle -maxdepth 3 -type f` returned no files while `git status --short` shows deleted former Drizzle migration artifacts.

- Observation: Prisma 7 no longer accepts `datasource.url` in `schema.prisma` for CLI workflows.
  Evidence: `pnpm run db:generate` failed with Prisma error `P1012` until the connection URL was moved into `packages/db/prisma.config.ts`.

- Observation: `pnpm install` and initial Prisma engine download both hit sandboxed network resolution failures.
  Evidence: `EAI_AGAIN` errors were returned for `registry.npmjs.org` and `binaries.prisma.sh` until the commands were rerun with escalation.

## Decision Log

- Decision: Keep the current physical PostgreSQL table and column names and express Prisma’s model naming through `@@map` and `@map`.
  Rationale: This minimizes behavioral risk and keeps the migration ORM-focused rather than turning it into a schema redesign.
  Date/Author: 2026-03-13 / Codex

- Decision: Allow Prisma to become the new migration baseline instead of trying to preserve Drizzle migration history.
  Rationale: The user explicitly approved a re-baseline, and the repository does not currently have a useful tracked Drizzle migration history to preserve.
  Date/Author: 2026-03-13 / Codex

- Decision: Keep `packages/db` as the single shared database workspace and keep root `db:*` script names stable.
  Rationale: This matches the current Turborepo layout and limits churn in Docker and root task orchestration.
  Date/Author: 2026-03-13 / Codex

- Decision: Use Prisma 7 `prisma.config.ts` plus the `prisma-client` generator outputting into `packages/db/src/generated/prisma`.
  Rationale: Prisma 7 requires datasource configuration outside the schema for CLI flows, and generating into `src` keeps the client available to the package TypeScript build without changing package export paths.
  Date/Author: 2026-03-13 / Codex

## Outcomes & Retrospective

The migration objective was completed for the shared DB package and active Nest API data-access layer.

- `packages/db` now owns Prisma schema/config, generated client exports, and a checked-in Prisma migration baseline.
- The Nest database service now manages Prisma connection lifecycle and still exposes a single shared client through dependency injection.
- `users`, `auth`, and `collections` services no longer import Drizzle tables or operators; they now use Prisma queries while preserving the existing API behavior.
- The Swagger description and README now describe Prisma instead of Drizzle.

Validation results:

- `CI=true pnpm install --no-frozen-lockfile` passed and updated `pnpm-lock.yaml`.
- `pnpm run db:generate` passed.
- `pnpm run check-types` passed.
- `pnpm run lint` passed.
- `pnpm run build` passed.

Validation not run:

- `pnpm run db:migrate` and `pnpm run db:deploy` were intentionally not executed against the configured database because they would mutate the live datasource referenced by the environment.

## Context and Orientation

The current repository root is `/home/lenovo/advanced-quiz`. The relevant deployable backend is `apps/api-new`, a NestJS application that currently imports Drizzle tables, operators, and row types from `@advanced-quiz/db`. The shared database package is `packages/db`, which currently exports a singleton Drizzle client, the Drizzle schema, and selected query-builder helpers. PostgreSQL access is configured through `DATABASE_URL`.

The main code paths that must change are:

- `packages/db/package.json`, `packages/db/src/client.ts`, `packages/db/src/index.ts`, and the replacement of `packages/db/src/schema.ts` / `packages/db/drizzle.config.ts` with Prisma files.
- `apps/api-new/src/database/*`, where the current global Nest database service wraps the Drizzle singleton and pool shutdown.
- `apps/api-new/src/users/users.service.ts`, `apps/api-new/src/auth/auth.service.ts`, `apps/api-new/src/collections/collections.service.ts`, and `apps/api-new/src/common/serialization.ts`, where Drizzle query APIs and Drizzle-derived row types are used directly.

Prisma will be generated inside `packages/db` and re-exported from that package so the API does not generate or own its own client.

## Plan of Work

First, convert `packages/db` back to a Prisma-owned package. Add `packages/db/prisma/schema.prisma` with models for the current application entities and PostgreSQL mappings that preserve the existing table and column names. Replace the Drizzle client with a Prisma singleton, re-export Prisma client types from the package entrypoint, and update package scripts to Prisma CLI commands. Remove Drizzle-specific exports and configuration from the shared package.

Second, refactor the Nest database integration under `apps/api-new/src/database` so the application receives a Prisma-backed service through constructor injection. The module remains global. The lifecycle service must connect on startup and disconnect on shutdown, following Nest lifecycle hooks.

Third, refactor the API’s data access code from Drizzle syntax to Prisma syntax while preserving behavior. The user service must keep its current password hashing and refresh-token semantics. The auth service must keep the current resend cooldowns, verification and password-reset behavior, and error responses. The collections service must keep current authorization checks and response shapes while translating relation loading, create/update/delete flows, and review queries to Prisma.

Fourth, update docs and runtime scripts that mention Drizzle so they describe Prisma accurately. Then run generation, migration, type-check, lint, and build commands, fix any regressions, and record the result in this document.

## Concrete Steps

From the repository root (`/home/lenovo/advanced-quiz`):

1. Create `packages/db/prisma/schema.prisma` and restore Prisma package exports and scripts in `packages/db`.
2. Remove Drizzle-specific code paths from `packages/db`.
3. Refactor `apps/api-new/src/database` to a Prisma lifecycle service while keeping the module global.
4. Rewrite `users.service.ts`, `auth.service.ts`, `collections.service.ts`, and `common/serialization.ts` to Prisma.
5. Update `apps/api-new/package.json`, `README.md`, and any remaining Drizzle references that affect the active runtime path.
6. Run:

   pnpm install
   pnpm run db:generate
   pnpm run check-types
   pnpm run lint
   pnpm run build

7. If Prisma migration SQL needs to be created for a clean database, run:

   pnpm run db:migrate

## Validation and Acceptance

Acceptance requires all of the following:

- `pnpm run db:generate` succeeds and produces a usable Prisma client in `packages/db`.
- `pnpm run check-types` succeeds across the workspaces.
- `pnpm run lint` succeeds for the configured packages.
- `pnpm run build` succeeds.
- The API still starts with the same `DATABASE_URL` contract.
- The API auth flow still supports registration, email verification, sign-in, refresh, logout, forgot-password, and reset-password.
- The collections and review flow still supports listing collections, collaborator management, flashcard CRUD, session start, due reviews, stats, review submission, and progress clearing.
- The API Docker image still runs pending database migrations through `pnpm --filter @advanced-quiz/db db:deploy` before starting the server.

## Idempotence and Recovery

The text and code edits are idempotent. Prisma generation can be repeated safely. If the initial migration SQL generated by Prisma is incorrect, delete only the newly generated Prisma migration directory and re-run `pnpm run db:migrate`. If validation fails, fix the failing code path and re-run the same command set until the repository is clean for the affected packages.

## Artifacts and Notes

Expected artifact changes:

- `packages/db/prisma/schema.prisma` added.
- `packages/db/src/schema.ts` removed or made obsolete.
- `packages/db/drizzle.config.ts` removed.
- `@advanced-quiz/db` exports Prisma client symbols and generated types instead of Drizzle query helpers.
- `apps/api-new/src/database/*` becomes Prisma-backed.

## Interfaces and Dependencies

Required database package interfaces after migration:

- `packages/db/src/client.ts` exports a shared `prisma` singleton.
- `packages/db/src/index.ts` re-exports `prisma`, `PrismaClient`, and generated Prisma model/type namespaces used by the API.

Required backend interfaces after migration:

- `apps/api-new/src/database/database.service.ts` exposes an injectable Prisma-backed service class.
- `apps/api-new/src/database/database.module.ts` remains a global Nest module and exports the service for feature modules.

Required dependencies after migration:

- `@prisma/client`
- `prisma`
- `pg`

Removed dependencies after migration:

- `drizzle-orm`
- `drizzle-kit`

---

Plan revision note (2026-03-13): Initial ExecPlan created after repository audit and guide review; captures the reverse migration from Drizzle back to Prisma and the explicit re-baseline decision.
Plan revision note (2026-03-13): Updated after implementation with Prisma 7 config changes, migration baseline generation, and successful validation results.
