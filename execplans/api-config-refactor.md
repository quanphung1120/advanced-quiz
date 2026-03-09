# Refactor API configuration to typed NestJS config providers

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md).

## Purpose / Big Picture

After this change, the NestJS API should start without constructor-time `ConfigService` injection failures, and configuration should be consumed through the official `@nestjs/config` namespaced provider pattern instead of ad hoc string lookups scattered through auth and bootstrap code. A developer should be able to run the API, see the app boot successfully with the same environment variables as before, and confirm that auth cookies, JWT signing, and mailer setup still read the expected values.

## Progress

- [x] 2026-03-09 09:25Z Investigated the current API config usage and confirmed that runtime failures come from constructor-time `ConfigService` injection in auth-related providers.
- [x] 2026-03-09 09:28Z Read the repository planning requirements in `PLANS.md` and created this ExecPlan before making the larger refactor.
- [x] 2026-03-09 09:45Z Implemented typed config namespaces in `apps/api-new/src/config` and loaded them from `AppModule`.
- [x] 2026-03-09 09:49Z Refactored auth providers and bootstrap to inject typed config providers instead of `ConfigService`.
- [x] 2026-03-09 09:54Z Validated with `pnpm --filter @advanced-quiz/config check-types`, `pnpm --filter @advanced-quiz/api check-types`, a local startup probe using `node --import tsx src/index.ts`, and updated `AGENTS.md` to reflect the new pattern.

## Surprises & Discoveries

- Observation: The API already validates server environment variables centrally through `packages/config/src/server.ts`, so the missing piece is the Nest provider integration pattern rather than schema coverage.
  Evidence: `apps/api-new/src/app.module.ts` uses `ConfigModule.forRoot({ validate: (config) => serverEnvSchema.parse(config) })`.

- Observation: The current backend only consumes Nest config in five places: bootstrap, JWT module registration, JWT strategy, auth controller/service, and auth mailer.
  Evidence: `rg -n "ConfigService|ConfigModule|getOrThrow|get<" apps/api-new/src` returned matches only in those files.

- Observation: Reading raw `process.env` inside `registerAs(...)` factories would have silently bypassed the existing Zod coercions for `PORT` and `ENABLE_DOCS`.
  Evidence: The first draft of `apps/api-new/src/config/*.config.ts` used `process.env` directly, which would have produced string values instead of the parsed numbers and booleans from `serverEnvSchema`.

- Observation: `pnpm --filter @advanced-quiz/api start` is not a reliable sandbox probe in this environment because the `tsx` CLI attempts to open an IPC pipe under `/tmp`, which is blocked here.
  Evidence: The sandbox returned `listen EPERM: operation not permitted /tmp/tsx-1000/...pipe`, while `node --import tsx src/index.ts` from `apps/api-new` was able to start Nest and reach module initialization logs.

## Decision Log

- Decision: Use namespaced config providers created with `registerAs(...)` inside the API app, while continuing to reuse `packages/config/src/server.ts` as the source of truth for environment validation.
  Rationale: This follows the NestJS configuration guide while preserving the existing shared Zod schema and avoiding a duplicate validation layer.
  Date/Author: 2026-03-09 / Codex

- Decision: Refactor all API-side constructor injections that currently depend on `ConfigService`, not just `JwtStrategy`.
  Rationale: The reported error has already spread to multiple files, which indicates the fix should remove the fragile injection pattern systematically rather than patching one provider at a time.
  Date/Author: 2026-03-09 / Codex

- Decision: Add `getServerEnv()` to `packages/config/src/server.ts` and reuse it in every API config namespace.
  Rationale: This preserves one validated and coerced source of truth for environment values and prevents drift between `ConfigModule.forRoot({ validate })` and the typed config factories.
  Date/Author: 2026-03-09 / Codex

## Outcomes & Retrospective

The backend now uses typed namespaced config providers for app runtime settings, auth settings, and mail settings. `ConfigService` has been removed from API feature providers, which eliminates the constructor metadata path that was producing `undefined` injections. Typechecks passed for both `@advanced-quiz/config` and `@advanced-quiz/api`, and a direct startup probe reached Nest module initialization without the earlier config-related crash.

## Context and Orientation

The NestJS backend lives in `apps/api-new/src`. The root module is `apps/api-new/src/app.module.ts`. The process entrypoint is `apps/api-new/src/index.ts`. Authentication code lives under `apps/api-new/src/auth`. Shared environment validation lives in `packages/config/src/server.ts`; that file defines required variables such as `AUTH_SECRET`, `WEB_URL`, `CORS_ORIGIN`, `RESEND_API_KEY`, and `PORT`.

NestJS configuration has two separate concerns in this repository. The first concern is validating raw environment variables from `.env`; this already exists through the Zod schema in `packages/config/src/server.ts`. The second concern is making those values available through Nest dependency injection. The current code solves the first concern but mostly relies on direct `ConfigService` usage for the second concern. This plan replaces those direct string lookups with typed, named providers that Nest can inject explicitly.

## Plan of Work

Create a small config layer inside `apps/api-new/src/config`. Add one file for app-level runtime settings such as `nodeEnv`, `apiUrl`, `corsOrigin`, `port`, `logLevel`, and `enableDocs`. Add one file for auth settings such as `authSecret` and `webUrl`. Add one file for mail settings such as `resendApiKey` and `resendFromEmail`. Each file should export a `registerAs(...)` provider and a corresponding `ConfigType`.

Update `apps/api-new/src/app.module.ts` so `ConfigModule.forRoot(...)` loads those config factories via `load: [...]` while still using `serverEnvSchema.parse(...)` for validation. Keep `isGlobal: true` and the current `.env` path so runtime behavior stays familiar.

Update `apps/api-new/src/auth/auth.module.ts` so `JwtModule.registerAsync(...)` depends on the typed auth config provider rather than `ConfigService`. Import the relevant `ConfigModule.forFeature(...)` providers needed by auth. Then refactor `apps/api-new/src/auth/jwt.strategy.ts`, `apps/api-new/src/auth/auth.service.ts`, `apps/api-new/src/auth/auth.controller.ts`, and `apps/api-new/src/auth/auth.mailer.ts` to inject typed config objects via `@Inject(configNamespace.KEY)` and `ConfigType<typeof configNamespace>`.

Update `apps/api-new/src/index.ts` so bootstrap reads the typed app and auth config providers from the Nest container instead of using `ConfigService` lookups for runtime values.

After code changes, run the API typecheck. If sandbox restrictions block a full runtime boot, document the exact failure and preserve the command needed for a local verification outside the sandbox. Finish by updating `AGENTS.md` to state that backend configuration now follows the typed namespaced NestJS pattern.

## Concrete Steps

From the repository root `/home/lenovo/advanced-quiz`, run:

    pnpm --filter @advanced-quiz/api check-types

If the sandbox allows a startup probe, run:

    pnpm --filter @advanced-quiz/api start

If the `tsx` CLI is blocked by sandbox IPC restrictions, run this equivalent command from `/home/lenovo/advanced-quiz/apps/api-new`:

    node --import tsx src/index.ts

Expected success after the refactor:

    > @advanced-quiz/api@0.0.1 start
    > tsx src/index.ts
    [Bootstrap] API listening on http://localhost:3001

If sandboxing blocks the process bootstrap, record the sandbox error and rerun the command locally outside the sandbox to confirm the fix.

## Validation and Acceptance

Acceptance means the backend compiles and the API no longer fails during provider construction because `ConfigService` is undefined. The observable proof is that `pnpm --filter @advanced-quiz/api check-types` succeeds and `pnpm --filter @advanced-quiz/api start` reaches application bootstrap instead of throwing inside `JwtStrategy`, `AuthService`, `AuthController`, or `AuthMailerService`.

Behavioral verification should include these checks:

1. Start the API with the same `.env` values used before.
2. Confirm startup logs reach the `API listening on ...` message.
3. Exercise an auth endpoint such as `POST /api/auth/login` or `POST /api/auth/register` and confirm no config-related DI error appears in the logs.

## Idempotence and Recovery

This refactor is additive and safe to repeat. The new config files can be regenerated without affecting data. If a specific provider fails after conversion, the safe rollback path is to restore the previous file revision for that provider and keep the config namespace definitions, because they do not alter external state. No database schema or persisted data is touched by this work.

## Artifacts and Notes

Useful evidence gathered before implementation:

    apps/api-new/src/app.module.ts uses ConfigModule.forRoot with Zod validation.
    apps/api-new/src/auth/* and apps/api-new/src/index.ts are the only backend files reading ConfigService directly.

Useful evidence gathered after implementation:

    pnpm --filter @advanced-quiz/config check-types
    pnpm --filter @advanced-quiz/api check-types
    rg -n "ConfigService" apps/api-new/src
    node --import tsx src/index.ts

## Interfaces and Dependencies

Use `@nestjs/config` official primitives already present in the repository: `ConfigModule`, `registerAs`, and `ConfigType`. The final code should expose stable provider names through the config factory `KEY` values and should inject those providers with explicit constructor parameters in auth and bootstrap paths. The existing dependency `@advanced-quiz/config/server` remains the validator for raw environment input.

Revision note: updated after implementation to record the validated `getServerEnv()` approach and the sandbox-safe startup probe command.
