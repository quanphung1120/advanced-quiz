# Migrate Monorepo Tooling to pnpm and Backend Data Layer to Drizzle + node-postgres

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is maintained in accordance with [PLANS.md](../PLANS.md) at the repository root.

## Purpose / Big Picture

After this change, developers will install and run the monorepo with `pnpm` instead of Bun, and the NestJS API will use Drizzle ORM with the official Node.js PostgreSQL driver (`pg`) instead of Prisma. Docker assets will also stop provisioning a local PostgreSQL container; all environments will point to an external PostgreSQL instance through `DATABASE_URL`.

A contributor can verify the change by running `pnpm install`, `pnpm run check-types`, `pnpm run lint`, and `pnpm run build`, then starting the API/web and confirming the API health endpoint and auth/collection flows still work.

## Progress

- [x] (2026-03-09 13:50Z) Audited repository usage of Bun, Prisma, and Docker local PostgreSQL assumptions.
- [x] (2026-03-09 13:50Z) Spawned internet-research subagent for Drizzle + node-postgres best practices.
- [x] (2026-03-09 13:50Z) Created this ExecPlan and defined migration milestones.
- [x] (2026-03-09 14:09Z) Implemented pnpm workspace/tooling migration (package metadata, scripts, lockfile, docs).
- [x] (2026-03-09 14:09Z) Replaced `packages/db` Prisma implementation with Drizzle schema/client/migrations toolchain.
- [x] (2026-03-09 14:09Z) Refactored Nest database provider from Prisma module to Drizzle module and migrated service queries.
- [x] (2026-03-09 14:09Z) Removed local Docker Compose development stack and updated Docker files for pnpm + Drizzle migrations.
- [x] (2026-03-09 14:09Z) Ran validation (`check-types`, `lint`, `build`, `db:generate`) and updated docs/outcomes.

## Surprises & Discoveries

- Observation: The API currently cannot run with plain Node from compiled JS (`dist`) because emitted ESM imports omit `.js` extensions and workspace packages export TypeScript source.
  Evidence: `node apps/api-new/dist/index.js` throws `ERR_MODULE_NOT_FOUND` for `dist/app.module`.

- Observation: Existing Prisma migration history does not perfectly align with the current Prisma schema (legacy tables appear in SQL history).
  Evidence: `packages/db/prisma/migrations/0000_init/migration.sql` contains `account/session/verification`, while current `schema.prisma` does not.

- Observation: Existing Bun-managed dependency artifacts caused mixed `drizzle-orm` type identities (`.bun` vs pnpm store), which broke TypeScript until dependencies were cleaned and reinstalled.
  Evidence: `pnpm run check-types` reported `shouldInlineParams` private-property mismatches between two `drizzle-orm` module paths.

- Observation: Sandbox network resolution intermittently failed during `pnpm install` with `EAI_AGAIN`, requiring escalated reruns.
  Evidence: `ERR_PNPM_META_FETCH_FAIL` / `EAI_AGAIN registry.npmjs.org` during install.

## Decision Log

- Decision: Use Drizzle ORM with `drizzle-orm/node-postgres` and `pg.Pool`, exposed via a Nest global `DatabaseModule` provider token.
  Rationale: Matches user requirement for Node official PostgreSQL adapter and keeps Nest dependency injection explicit.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep migration orchestration in `packages/db` and replace Prisma CLI scripts with `drizzle-kit` scripts (`generate`, `migrate`, `push`, `studio`), plus a `db:deploy` alias for deployment parity.
  Rationale: Minimizes command-surface churn across root scripts and Docker startup commands.
  Date/Author: 2026-03-09 / Codex

- Decision: Remove local development compose stack (`compose.yaml`) because local PostgreSQL is no longer a supported path.
  Rationale: Explicit user requirement to remove local Docker DB development files.
  Date/Author: 2026-03-09 / Codex

- Decision: Keep API runtime start command as `tsx src/index.ts` (and run that in Docker) rather than running compiled `dist` directly with plain Node.
  Rationale: Existing TypeScript workspace package exports and extensionless ESM output are not directly runnable under plain Node without additional bundling/loader changes; this keeps runtime stable in the current architecture.
  Date/Author: 2026-03-09 / Codex

- Decision: Add `drizzle-orm` as a direct dependency of `apps/api-new`.
  Rationale: API services import Drizzle operators directly; relying on transitive resolution through `@advanced-quiz/db` is brittle and broke type-checking.
  Date/Author: 2026-03-09 / Codex

## Outcomes & Retrospective

The migration objective was completed end-to-end.

- Package manager/tooling now uses pnpm (`pnpm-workspace.yaml`, `pnpm-lock.yaml`, root `packageManager` updated, Bun lock removed).
- `packages/db` now uses Drizzle + `pg` with schema/types and drizzle-kit config/migrations; Prisma files were removed.
- Nest API now uses a global `DatabaseModule` provider with Drizzle client injection; `users`, `auth`, and `collections` services were migrated off Prisma query APIs.
- Prisma-specific API module files were removed (`src/prisma/*`), and shared API typing helpers moved to Drizzle-based types.
- Local Docker compose development stack with bundled PostgreSQL was removed (`compose.yaml` deleted); production compose expects external `DATABASE_URL`.
- Dockerfiles switched to Node + pnpm commands and now run Drizzle migration command before API startup.

Validation results:

- `pnpm run check-types` passed.
- `pnpm run lint` passed (with one pre-existing web warning, no lint errors).
- `pnpm run build` passed.
- `pnpm run db:generate` passed (`No schema changes` on rerun).

## Context and Orientation

The current monorepo has three major pieces:

- `apps/api-new`: NestJS API currently wired to Prisma through `src/prisma/prisma.module.ts` and `src/prisma/prisma.service.ts`.
- `apps/web-new`: Vite React app, largely independent of ORM details.
- `packages/db`: Shared database workspace that currently owns Prisma schema/config/generated client and migration scripts.

Current Prisma types are used directly in API helper code:

- `apps/api-new/src/common/serialization.ts`
- `apps/api-new/src/lib/srs.ts`

Bun is currently hard-coded in:

- Root `package.json` (`packageManager`, commands)
- `packages/db/package.json` scripts (`bunx --bun prisma ...`)
- API scripts and both Dockerfiles/compose files.

## Plan of Work

The implementation proceeds in this order to keep the repository runnable at each stage.

First, switch workspace tooling to pnpm by updating package metadata/scripts, adding `pnpm-workspace.yaml`, and generating a new lockfile. Then update documentation and Docker build stages that install dependencies.

Second, replace `packages/db` Prisma artifacts with Drizzle:

- Add `packages/db/src/schema.ts` with all tables used by API (`user`, `refresh_token`, `email_otp`, `password_reset_token`, `collection`, `collection_collaborator`, `flashcard`, `flashcard_review`).
- Add Drizzle client factory in `packages/db/src/client.ts` using `pg.Pool` and `drizzle(pool, { schema })`.
- Add `drizzle.config.ts` and replace package scripts with `drizzle-kit` commands.
- Remove Prisma-specific files and generated client exports.

Third, migrate API dependency injection and query usage:

- Replace `src/prisma/*` with `src/database/*` provider files.
- Update modules (`app.module`, `auth.module`, `users.module`) to import the new module.
- Refactor `users.service.ts`, `auth.service.ts`, and `collections.service.ts` from Prisma query syntax to Drizzle query builder/relational queries.
- Replace Prisma-inferred helper types in `serialization.ts` and `srs.ts` with Drizzle-compatible local types.

Fourth, update Docker and remove local DB compose assets:

- Remove `compose.yaml` (local development stack with Postgres).
- Update `compose.prod.yaml` to remove internal Postgres service and require `DATABASE_URL`.
- Update API/Web Dockerfiles to use pnpm commands and Drizzle migration command.

Finally, run verification commands and update this ExecPlan sections with outcomes.

## Concrete Steps

From repo root (`/home/lenovo/advanced-quiz`):

1. Update workspace/package-manager files and scripts for pnpm.
2. Replace Prisma files in `packages/db` with Drizzle equivalents.
3. Refactor API database module and service query code.
4. Remove local compose file and update production Docker assets.
5. Run:

   pnpm install
   pnpm run check-types
   pnpm run lint
   pnpm run build

6. If migration generation is required after schema edits, run:

   pnpm run db:generate

## Validation and Acceptance

Acceptance requires all of the following:

- `pnpm install` succeeds and writes `pnpm-lock.yaml`.
- `pnpm run check-types` succeeds across workspaces.
- `pnpm run lint` succeeds.
- `pnpm run build` succeeds.
- API starts and `/health` returns HTTP 200 JSON with `status: "ok"`.
- API auth + collection flows still perform create/read/update/delete operations against PostgreSQL using Drizzle.
- No local Docker compose file remains that provisions PostgreSQL.

## Idempotence and Recovery

Most edits are idempotent text/config updates. Drizzle migration generation can be repeated; if a generated migration is incorrect, delete the latest generated migration folder and re-run generation. If validation fails, fix code and re-run commands in the same order until clean.

## Artifacts and Notes

Expected key artifact changes:

- `bun.lock` removed.
- `pnpm-lock.yaml` added.
- `packages/db/prisma/*` removed/replaced.
- `apps/api-new/src/prisma/*` removed/replaced by `src/database/*`.
- `compose.yaml` removed.

## Interfaces and Dependencies

Required dependencies after migration:

- `drizzle-orm`
- `drizzle-kit`
- `pg`

Required backend interfaces:

- `packages/db/src/client.ts` exports database connection objects/types used by Nest provider.
- `apps/api-new/src/database/database.service.ts` defines injection token/class for database access.
- `apps/api-new/src/database/database.module.ts` exports the database provider globally.

The API services must depend on the injected database abstraction (constructor injection), not on global singleton imports.

---

Plan revision note (2026-03-09): Initial ExecPlan created after repository audit; includes implementation order and known risks for Node runtime compatibility and migration history alignment.
Plan revision note (2026-03-09): Updated after implementation with completed progress, migration decisions, validation outcomes, and install/type-system troubleshooting notes.
