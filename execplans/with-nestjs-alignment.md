# Align workspace packaging with Turborepo `with-nestjs`

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, the monorepo will follow the important structural pattern from Turborepo’s `examples/with-nestjs`: deployable applications stay in `apps/`, shared backend-facing code is modeled as real internal packages, and Turbo starts or builds upstream packages before the Nest app consumes them. The observable result is that `packages/contracts` and `packages/db` stop exporting raw TypeScript source as runtime entry points, `pnpm run build` builds them into `dist/`, and the filtered development commands bring along the dependency packages the apps need.

## Progress

- [x] (2026-03-12 14:32Z) Audited the current root scripts, Turbo task graph, Nest app package, and shared workspace packages.
- [x] (2026-03-12 14:32Z) Fetched the upstream `with-nestjs` example files and confirmed the main gap is built shared backend packages rather than app-level folder names.
- [x] (2026-03-12 14:36Z) Converted `packages/contracts` into a built internal package with `build` and `dev` scripts plus `dist`-based runtime exports.
- [x] (2026-03-12 14:36Z) Converted `packages/db` into a built internal package with `build` and `dev` scripts plus `dist`-based runtime exports.
- [x] (2026-03-12 14:36Z) Updated root Turbo and package scripts so filtered `dev` commands include upstream package watchers and `check-types` builds upstream packages first.
- [x] (2026-03-12 14:36Z) Added the repo-root TypeScript config and aligned the Nest app package metadata by declaring `@nestjs/cli`.
- [x] (2026-03-12 14:38Z) Updated the pnpm lockfile and workspace links with `CI=true pnpm install --no-frozen-lockfile`.
- [x] (2026-03-12 14:38Z) Validated `pnpm exec turbo run build --filter=@advanced-quiz/api...` successfully.
- [x] (2026-03-12 14:38Z) Validated `pnpm exec turbo run check-types --filter=@advanced-quiz/api...` successfully.
- [x] (2026-03-12 14:38Z) Recorded that full root `pnpm run build` is still blocked by pre-existing TypeScript errors in `apps/web-new`.

## Surprises & Discoveries

- Observation: This repository already matches the example’s high-level `apps/*` and `packages/*` shape, so the meaningful gap is package behavior, not directory placement.
  Evidence: `apps/api-new`, `apps/web-new`, and `packages/*` already exist; the upstream example differs mainly in how `packages/api` is packaged and built.

- Observation: `apps/api-new` uses `nest` in its scripts but does not currently have `@nestjs/cli` installed in the workspace package.
  Evidence: `apps/api-new/package.json` defines `dev`, `build`, and `start` with `nest ...`, while `node_modules/.bin/nest` is absent in the current install.

- Observation: `packages/db` originally emitted `dist/src/*`, which did not match the new `dist/*.js` export map.
  Evidence: The first root build failed with `TS2307: Cannot find module '@advanced-quiz/db'`, and `find packages/db/dist` showed files under `dist/src/` until `rootDir` was set to `./src`.

- Observation: The current repository root cannot complete a full `pnpm run build` because `apps/web-new` already contains unrelated TypeScript resolution and typing failures.
  Evidence: The root build failed in `apps/web-new` with many `TS2307` and `TS2835` errors such as unresolved `@/` imports and missing explicit extensions in barrel files before the API-side changes were fully validated.

- Observation: Refreshing the lockfile required a networked install outside the sandbox.
  Evidence: `CI=true pnpm install --no-frozen-lockfile` failed in the sandbox with `EAI_AGAIN registry.npmjs.org`, then succeeded when rerun with escalated network access.

## Decision Log

- Decision: Preserve the existing workspace names such as `apps/api-new`, `apps/web-new`, and `packages/contracts` instead of renaming folders to match the example literally.
  Rationale: The user asked to configure the projects following the example. The structural behavior matters here, while a folder rename would create broad churn with little architectural benefit.
  Date/Author: 2026-03-12 / Codex

- Decision: Align the backend-oriented internal packages with the example by making them built packages, while leaving the UI package in the existing source-exported model.
  Rationale: The upstream example keeps `@repo/ui` source-exported but uses a built package for shared Nest-facing resources. That maps cleanly onto `packages/ui` versus `packages/contracts` and `packages/db` in this repository.
  Date/Author: 2026-03-12 / Codex

## Outcomes & Retrospective

The repository now follows the important `with-nestjs` package behavior for backend-facing workspaces without renaming existing folders. `packages/contracts` and `packages/db` are real built internal packages with `build` and `dev` scripts, `dist` runtime entry points, and Turbo-visible build outputs. The root `dev` commands now use dependency-expanding filters, so starting the API or web slice also starts the dependency packages they rely on.

The API slice is validated end to end through Turbo: `pnpm exec turbo run build --filter=@advanced-quiz/api...` and `pnpm exec turbo run check-types --filter=@advanced-quiz/api...` both succeeded after the package changes. The remaining gap is outside the scope of this configuration task: full-root `pnpm run build` still fails because `apps/web-new` already has unresolved TypeScript import and typing errors in the current working tree.

## Context and Orientation

The repository root is `/home/lenovo/advanced-quiz`. The deployable NestJS API lives in `apps/api-new`, and the deployable Vite React application lives in `apps/web-new`. Shared code is under `packages/`. The relevant shared backend packages today are `packages/contracts`, which contains Zod schemas and TypeScript types used by both the API and web app, and `packages/db`, which contains the Drizzle database client and schema used by the API.

In the current state, both `packages/contracts/package.json` and `packages/db/package.json` export `src/*.ts` files directly as runtime entry points. That is convenient for local development but does not match the `with-nestjs` example’s shared backend package model, where the internal package builds to `dist/` and applications consume the built output. The root `package.json` also filters `dev` to the two apps only, which means a built dependency package would not automatically be watched unless the filters are widened to include upstream dependencies.

In Turborepo terms, a built internal package is a workspace package that emits JavaScript and type declarations into `dist/`, declares those files in `package.json`, and participates in the Turbo `build` and `dev` graph just like an application. A filtered dev command such as `turbo run dev --filter=@advanced-quiz/api...` means “run the `dev` task for the API package and its dependency packages too,” which is exactly what is needed once shared backend packages become build artifacts.

## Plan of Work

Update `packages/contracts/package.json` so it behaves like the upstream shared backend package: add `build` and `dev` scripts, set `main` and `types` to `dist`, add a `files` allowlist, and move runtime exports to generated files. Keep `packages/contracts/tsconfig.json` as the emitting TypeScript config for that package.

Apply the same packaging model to `packages/db/package.json`, preserving the existing `db:*` scripts while adding package build and watch scripts plus `dist`-based exports for `.`, `./client`, and `./schema`. Keep `packages/db/tsconfig.json` emitting to `dist/`.

Update the root `package.json` so `dev`, `dev:api`, and `dev:web` use Turbo filters with `...`, which includes dependency packages. Add the root `tsconfig.json` that the upstream example ships, backed by `@advanced-quiz/typescript-config`, and update `turbo.json` so `check-types` depends on upstream builds. Remove the unnecessary `lint -> ^build` dependency because the upstream example keeps lint independent of builds.

Finally, update `apps/api-new/package.json` to include `@nestjs/cli` so the existing `nest` scripts are correctly declared. Do not change application logic or folder structure.

## Concrete Steps

Run the following commands from `/home/lenovo/advanced-quiz`:

    pnpm run build

This should build `packages/contracts`, `packages/db`, and the applications in Turbo dependency order.

    pnpm run check-types

This should pass after Turbo builds upstream packages before typechecking dependents.

If `pnpm` reports missing lockfile entries for `@nestjs/cli`, run:

    CI=true pnpm install --no-frozen-lockfile

Then re-run the build and typecheck commands. This repository required the non-frozen install because the root `package.json` gained a workspace dependency on `@advanced-quiz/typescript-config`.

## Validation and Acceptance

Acceptance is met when the following behavior is true:

`packages/contracts/package.json` and `packages/db/package.json` declare built-package metadata with `dist` runtime exports and package-local `build` and `dev` scripts.

`pnpm exec turbo run build --filter=@advanced-quiz/api...` runs Turbo package builds for those shared packages before the app build, and the packages emit files into `dist/`.

`pnpm exec turbo run check-types --filter=@advanced-quiz/api...` succeeds with Turbo ensuring the built dependency packages exist before application typechecking runs.

The repo root contains `tsconfig.json` extending `@advanced-quiz/typescript-config/base.json`, mirroring the upstream example’s repo-level TypeScript setup.

The root `dev` scripts use Turbo dependency filters so starting an app also starts the watch tasks of any built dependency packages it needs.

## Idempotence and Recovery

These are additive configuration changes and can be re-applied safely. If a built internal package fails to resolve after the change, the safe recovery path is to inspect the package’s `exports`, `main`, `types`, and `outDir` settings and correct those fields rather than restoring raw `src/*.ts` runtime exports. If `pnpm install` is needed to add `@nestjs/cli`, rerunning it is safe because the repository already uses a lockfile-managed pnpm workspace.

## Artifacts and Notes

Key evidence captured before and during implementation:

    examples/with-nestjs/package.json uses `turbo run dev` and `turbo run build`.

    examples/with-nestjs/packages/api/package.json defines `build`, `dev`, `main`, `types`, `files`, and `dist` exports.

    packages/contracts/package.json and packages/db/package.json in this repo currently export raw TypeScript source from `src/`.

    apps/api-new/package.json uses `nest start` and `nest build`, but its declared package dependency list did not include `@nestjs/cli` until this change.

    The first root build after switching `packages/db` to `dist` exports failed because `packages/db/dist` was emitted under `dist/src/*`; setting `rootDir` to `./src` fixed the mismatch.

    `pnpm exec turbo run build --filter=@advanced-quiz/api...` completed successfully after the packaging changes.

    `pnpm exec turbo run check-types --filter=@advanced-quiz/api...` completed successfully after the packaging changes.

## Interfaces and Dependencies

At the end of this change, `packages/contracts/package.json` must expose:

    "main": "./dist/index.js"
    "types": "./dist/index.d.ts"

and a root export that resolves to the generated `dist` files at runtime.

At the end of this change, `packages/db/package.json` must expose:

    "."
    "./client"
    "./schema"

with generated `dist/*.js` runtime entry points and matching declaration files.

The root `tsconfig.json` must extend `@advanced-quiz/typescript-config/base.json`, and `turbo.json` must keep `build` as a package task with `dist/**` outputs while making `check-types` build upstream packages first.

Revision note: Created this ExecPlan after auditing the existing workspace and fetching the upstream `with-nestjs` example files to scope the alignment to package behavior rather than folder renames.

Revision note: Updated the plan after implementation to record the `packages/db` emit-path fix, the networked lockfile refresh, the successful API-slice Turbo validation, and the unrelated `apps/web-new` build blocker discovered during root validation.
