# Migrate from shared config package to app-local config

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md).

## Purpose / Big Picture

After this change, the API will own its runtime configuration inside `apps/api-new` instead of depending on the shared `packages/config` workspace. A developer should be able to typecheck and start the API with the same environment variables as before, while the repository structure makes it clear that runtime config is dedicated to each app rather than shared across workspaces.

## Progress

- [x] 2026-03-11 06:28Z Investigated current `@advanced-quiz/config` usage and confirmed that only `apps/api-new/src/app.module.ts` imports it directly, while other API files still rely on `ConfigService` string lookups.
- [x] 2026-03-11 06:31Z Read `PLANS.md` and created this ExecPlan before making the refactor.
- [x] 2026-03-11 07:07Z Implemented API-local environment schema and typed config namespaces under `apps/api-new/src/config`.
- [x] 2026-03-11 07:07Z Refactored API bootstrap and auth code to inject typed dedicated config providers instead of `ConfigService`.
- [x] 2026-03-11 07:07Z Removed `@advanced-quiz/config` from workspace dependencies, deleted the `packages/config` files, and updated repository guidance to describe config as app-local.
- [x] 2026-03-11 07:07Z Validated with targeted searches, `pnpm --filter @advanced-quiz/api check-types`, and a local startup probe that reached Nest startup before the sandbox blocked the port bind.

## Surprises & Discoveries

- Observation: The previous API config refactor plan in `execplans/api-config-refactor.md` describes app-local typed config providers, but the current working tree does not contain `apps/api-new/src/config`.
  Evidence: `rg --files apps/api-new/src/config` returned no files on 2026-03-11.

- Observation: The web app already keeps its runtime config in `apps/web-new/src/config`, so the shared config workspace is not a true cross-app dependency anymore.
  Evidence: `rg -n "@advanced-quiz/config|packages/config" /home/lenovo/advanced-quiz` only found runtime usage in `apps/api-new/src/app.module.ts`.

- Observation: The dedicated config refactor did not introduce any Nest dependency wiring regressions; the API completed module initialization and route mapping before the sandbox denied binding to `0.0.0.0:3001`.
  Evidence: `node --import tsx src/index.ts` logged `Nest application successfully started` and then failed with `listen EPERM: operation not permitted 0.0.0.0:3001`.

## Decision Log

- Decision: Scope this refactor to the API and repository metadata instead of inventing a new shared replacement.
  Rationale: The user asked to prefer dedicated config over a shared config package, and the web app already follows that model. The remaining mismatch is the API.
  Date/Author: 2026-03-11 / Codex

- Decision: Remove `packages/config` entirely once the API owns its schema and config factories.
  Rationale: Keeping an unused workspace would preserve the same ambiguity the user wants removed and invites future drift.
  Date/Author: 2026-03-11 / Codex

- Decision: Patch `pnpm-lock.yaml` manually to remove only the stale `@advanced-quiz/config` importer and workspace entry.
  Rationale: The lockfile already contains unrelated user changes, so a broad `pnpm install` would risk rewriting dependency state outside this refactor.
  Date/Author: 2026-03-11 / Codex

## Outcomes & Retrospective

The API now owns its environment schema and typed runtime config under `apps/api-new/src/config`, and the auth/bootstrap path no longer depends on `ConfigService` string lookups or the deleted `packages/config` workspace. `pnpm --filter @advanced-quiz/api check-types` passed, and a runtime probe reached full Nest startup before the sandbox blocked the port bind. The result matches the original goal: runtime config is now dedicated per application, consistent with the existing web app structure.

## Context and Orientation

The NestJS API lives in `apps/api-new/src`. The root module is `apps/api-new/src/app.module.ts`, the process entrypoint is `apps/api-new/src/index.ts`, and authentication code lives under `apps/api-new/src/auth`. Today the root module validates environment variables by importing `serverEnvSchema` from `@advanced-quiz/config/server`, while the rest of the API reads individual values through `ConfigService.getOrThrow(...)`.

The shared config workspace lives in `packages/config`. It contains `src/shared.ts`, `src/server.ts`, and `src/client.ts`, but the current codebase only consumes the server schema from the API. Because the web app already keeps config under `apps/web-new/src/config`, the shared package no longer represents actual shared runtime behavior.

In NestJS, a "config provider" is a named object registered with `@nestjs/config` via `registerAs(...)`. Code can inject that object directly with `@Inject(configNamespace.KEY)` and `ConfigType<typeof configNamespace>`, which is safer than scattered string keys.

## Plan of Work

Add a dedicated config layer inside `apps/api-new/src/config`. Create one file that defines the API environment schema with Zod and exports `serverEnvSchema`, `ServerEnv`, and `getServerEnv()`. Create three config namespace files for app runtime settings, auth settings, and mail settings. Each namespace should call `getServerEnv()` so all consumers share the same parsed and coerced values.

Update `apps/api-new/src/app.module.ts` so `ConfigModule.forRoot(...)` validates environment variables with the local `serverEnvSchema` and loads the new config namespaces. Then refactor `apps/api-new/src/index.ts`, `apps/api-new/src/auth/auth.module.ts`, `apps/api-new/src/auth/auth.service.ts`, `apps/api-new/src/auth/jwt.strategy.ts`, `apps/api-new/src/auth/auth.controller.ts`, and `apps/api-new/src/auth/auth.mailer.ts` to inject typed config providers instead of `ConfigService`.

After the API no longer references `@advanced-quiz/config`, remove that dependency from `apps/api-new/package.json`, delete the `packages/config` workspace files, and update `AGENTS.md` so repository guidance says runtime config should live inside each application. Finally, run verification commands and capture the results here.

## Concrete Steps

From the repository root `/home/lenovo/advanced-quiz`, the expected verification commands are:

    rg -n "@advanced-quiz/config|ConfigService" apps/api-new/src apps/api-new/package.json AGENTS.md
    pnpm --filter @advanced-quiz/api check-types

If the sandbox permits a runtime probe, run from `/home/lenovo/advanced-quiz/apps/api-new`:

    node --import tsx src/index.ts

Expected success after the refactor:

    No matches for @advanced-quiz/config in apps/api-new/src or apps/api-new/package.json
    TypeScript exits successfully for @advanced-quiz/api
    Nest startup reaches "API listening on ..."

Observed results on 2026-03-11:

    rg -n "@advanced-quiz/config|ConfigService" apps/api-new/src apps/api-new/package.json AGENTS.md
    # exit code 1 (no matches)

    pnpm --filter @advanced-quiz/api check-types
    > @advanced-quiz/api@0.0.1 check-types /home/lenovo/advanced-quiz/apps/api-new
    > tsc --noEmit

    node --import tsx src/index.ts
    [Nest] ... LOG [NestApplication] Nest application successfully started
    [Nest] ... ERROR [NestApplication] Error: listen EPERM: operation not permitted 0.0.0.0:3001

## Validation and Acceptance

Acceptance means the API validates and consumes environment variables from files under `apps/api-new/src/config` only, the repository no longer has a runtime dependency on `packages/config`, and the API still compiles and boots with the same environment contract. Observable proof is:

1. Searching the API shows no remaining `@advanced-quiz/config` import and no `ConfigService` usage in the auth/bootstrap path.
2. `pnpm --filter @advanced-quiz/api check-types` succeeds.
3. A startup probe reaches application bootstrap unless blocked by sandbox constraints; if blocked, the exact sandbox error is recorded here.

## Idempotence and Recovery

This refactor is safe to repeat because it only moves configuration code and package metadata. No database schema or persisted state changes. If a config namespace file is wrong, the safe recovery path is to restore the affected API files and rerun `pnpm --filter @advanced-quiz/api check-types` until the API compiles again. Deleting `packages/config` is safe once the search command in `Concrete Steps` shows no remaining references outside historical planning documents.

## Artifacts and Notes

Initial evidence gathered before implementation:

    apps/api-new/src/app.module.ts imports serverEnvSchema from @advanced-quiz/config/server.
    apps/api-new/src/auth/* and apps/api-new/src/index.ts still inject ConfigService directly.
    apps/web-new/src/config already exists, so app-local config is already the frontend pattern.

Post-change evidence:

    apps/api-new/src/config/server-env.ts now defines the API environment contract locally.
    apps/api-new/src/index.ts injects appConfig/authConfig instead of ConfigService.
    pnpm-lock.yaml no longer contains an apps/api-new importer entry for @advanced-quiz/config.

## Interfaces and Dependencies

Use the dependencies already present in `apps/api-new`: `@nestjs/config` for config providers and `zod` for validation. The final API should expose these local modules:

    apps/api-new/src/config/server-env.ts
    apps/api-new/src/config/app.config.ts
    apps/api-new/src/config/auth.config.ts
    apps/api-new/src/config/mail.config.ts

Each config module should export a stable provider token through `registerAs(...)`, and API consumers should inject those tokens with `ConfigType<typeof ...>`.

Revision note: updated on 2026-03-11 after implementation to record validation results, the manual lockfile cleanup, and the final dedicated-config structure.
