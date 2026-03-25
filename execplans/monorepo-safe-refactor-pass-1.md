# Improve monorepo task hygiene, package quality gates, and low-risk web performance

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md) and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the repository should keep the same runtime behavior while being easier to work in day to day. Turbo should stop hashing obvious local build junk, generated database artifacts should stop polluting the working tree, the API/contracts/db workspaces should participate in root linting, and the web app should avoid one unnecessary study-page fetch while surfacing real auth transport failures instead of silently treating them as “logged out”.

A contributor can see the result by running `pnpm run lint`, `pnpm run check-types`, and `pnpm run build` from the repository root. They should also see a cleaner `git status` around generated Prisma and TypeScript cache files, and the SRS page should no longer require a redundant flashcard list request just to decide whether a deck is empty.

## Progress

- [x] 2026-03-15 10:08Z Audited the current workspace structure, Turbo task graph, root scripts, package manifests, and the existing in-flight refactor state.
- [x] 2026-03-15 10:12Z Confirmed that `check-types` currently triggers full downstream builds and that Turbo hashes local `dist`, `.turbo`, and `node_modules` artifacts as task inputs.
- [x] 2026-03-15 10:15Z Collected focused audits for the API and web applications to separate low-risk fixes from higher-risk architecture changes.
- [x] 2026-03-15 10:20Z Chose a safe pass-1 scope: Turbo/cache hygiene, generated-file cleanup, repository lint coverage, low-risk web data-flow cleanup, and small import/config simplifications.
- [x] 2026-03-15 10:35Z Implemented the scoped refactor edits across Turbo config, ignore files, package manifests, shared ESLint config, and the web routing/auth/SRS paths.
- [x] 2026-03-15 10:35Z Refreshed workspace links with `pnpm install --no-frozen-lockfile`.
- [x] 2026-03-15 10:35Z Ran `pnpm run lint` successfully, now including `@advanced-quiz/api`, `@advanced-quiz/contracts`, and `@advanced-quiz/db`.
- [x] 2026-03-15 10:35Z Ran `pnpm run check-types` successfully.
- [x] 2026-03-15 10:35Z Ran `pnpm run build` successfully.
- [x] 2026-03-15 10:36Z Re-ran `pnpm turbo run build check-types lint --dry=json` and confirmed the API and web build tasks no longer hash `dist/**` or `node_modules/**` as inputs.

## Surprises & Discoveries

- Observation: Turbo currently treats local build artifacts as task inputs in this worktree.
  Evidence: `pnpm turbo run build check-types lint --dry=json` includes `dist/**`, `.turbo/**`, and `node_modules/**` paths inside task input hashes for `@advanced-quiz/api` and `@advanced-quiz/web`.

- Observation: The database workspace currently produces generated and compiled files in places that are not ignored cleanly.
  Evidence: `git status --short` reports `packages/db/prisma.config.js`, `packages/db/src/client.js`, `packages/db/src/index.js`, `packages/db/src/generated/`, and root-level `tsconfig.tsbuildinfo` artifacts as untracked noise.

- Observation: Root linting only covers the React workspaces today.
  Evidence: `pnpm run lint` executes only `@advanced-quiz/web` and `@advanced-quiz/ui`, while `apps/api-new/package.json`, `packages/contracts/package.json`, and `packages/db/package.json` currently lack a `lint` script.

- Observation: The web app already has evidence-backed, low-risk performance and resiliency cleanup available without changing routing or backend contracts.
  Evidence: `apps/web-new/src/pages/learn/srs-page.tsx` fetches flashcards only to check for an empty deck, and `apps/web-new/src/features/auth/api/auth-client.ts` currently collapses all session fetch failures into `null`.

- Observation: Per-package `turbo.json` files were silently disabling lint coverage for some workspaces.
  Evidence: `apps/api-new/turbo.json`, `packages/contracts/turbo.json`, and `packages/db/turbo.json` each contained `"lint": { "extends": false }`, which is why the first root lint run still executed only the React workspaces even after adding package `lint` scripts.

- Observation: Route-level lazy loading materially improved the frontend entry chunk without changing routes.
  Evidence: the earlier build output reported `dist/assets/index-*.js` at roughly `2,804.83 kB`, while the post-refactor build reports `dist/assets/index-tP01KZgu.js` at `624.73 kB` and splits large page/feature code into separate chunks like `home-page`, `dashboard-page`, `collection-page`, and `mermaid-*`.

- Observation: root cacheable tasks were also hashing `.env` files for packages whose outputs do not depend on environment values.
  Evidence: the initial dry-run showed `.env` in API build inputs, while the final dry-run reports `"apiBuildHasEnvInput": false` and keeps env-file hashing only for the web build where Vite output actually depends on it.

## Decision Log

- Decision: Treat this as a safe pass-1 monorepo refactor instead of attempting a transport-layer or package-export rewrite.
  Rationale: The worktree is already dirty with broader structural changes, and the highest-risk issues uncovered in the audit involve API transport abstraction and DB factory ownership. Those deserve their own focused change set.
  Date/Author: 2026-03-15 / Codex

- Decision: Keep the current `check-types -> build` dependency for now.
  Rationale: The compiled library packages still publish `dist`-based type entrypoints, so removing that dependency without reworking package exports would risk breaking local and CI type resolution.
  Date/Author: 2026-03-15 / Codex

- Decision: Add a shared non-React ESLint config and expand lint coverage to the API, contracts, and DB packages now.
  Rationale: This improves code quality and consistency across the monorepo without affecting runtime behavior, and it aligns the root `lint` command with contributor expectations.
  Date/Author: 2026-03-15 / Codex

- Decision: Prefer small, evidence-backed web fixes in this pass: remove the redundant SRS fetch, surface auth transport errors, simplify Tailwind integration, and normalize a few noisy imports.
  Rationale: These changes have clear user or developer value, are low-risk, and fit the “incremental safe refactor” requirement.
  Date/Author: 2026-03-15 / Codex

- Decision: Exclude `.env` files from cacheable root task inputs by default and opt the web build back into env-file hashing explicitly.
  Rationale: Linting, typechecking, and most TypeScript builds in this repository do not produce different outputs when local env files change, so hashing those files reduces cache reuse without improving correctness. The web build is the exception because Vite embeds env values into bundle output.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

This pass achieved the intended safe-refactor scope without changing the application surface area. Turbo now excludes obvious local artifacts from hashed inputs, the build task restores Prisma-generated client output through cache outputs, TypeScript build metadata moved into ignored cache locations, and repository ignore files now match the actual generated DB paths in this worktree.

The repository lint workflow is meaningfully better: `pnpm run lint` now covers the API, contracts, and DB workspaces through a shared non-React ESLint config instead of silently skipping those packages. The first expanded lint run surfaced a real API issue, an unused `Inject` import in `apps/api-new/src/collections/collections.controller.ts`, which was fixed as part of the refactor.

The web app received two low-risk behavior-preserving improvements plus one packaging simplification. The SRS page no longer performs a redundant flashcard fetch just to detect an empty collection, session loading now distinguishes expected `401/403` responses from real backend failures, and the app uses route-level lazy loading so the production entry bundle is much smaller. Tailwind now uses the Vite plugin path without the redundant PostCSS config.

## Context and Orientation

This repository is a pnpm workspace and Turborepo monorepo rooted at `/home/lenovo/advanced-quiz`. The API lives in `apps/api-new`, the frontend lives in `apps/web-new`, and shared libraries/config live in `packages/*`. The current repository state is already dirty because prior refactors are in flight, so this pass must improve the monorepo without undoing or rewriting unrelated work.

In this plan, “task hygiene” means making Turbo hash only the source and config inputs that should matter for cache correctness. “Generated-file hygiene” means keeping Prisma client output, transient JavaScript files, and TypeScript build metadata out of normal source-control noise. “Lint coverage” means the root `pnpm run lint` command should include the major TypeScript workspaces instead of silently skipping the backend and shared non-React packages.

The key files for this pass are:

- `turbo.json` for task inputs and outputs.
- `.gitignore` and `.prettierignore` for generated-file handling.
- `packages/eslint-config/*` plus new `eslint.config.js` files in non-React workspaces.
- `packages/contracts/tsconfig.json` and `packages/db/tsconfig.json` for TypeScript cache placement.
- `apps/web-new/package.json`, `apps/web-new/vite.config.ts`, `apps/web-new/src/pages/app-routes.tsx`, `apps/web-new/src/pages/learn/srs-page.tsx`, and `apps/web-new/src/features/auth/api/auth-client.ts` for low-risk frontend cleanup.

## Plan of Work

First, update the repository metadata and tooling so generated output stops polluting both Turbo hashes and `git status`. That means tightening `turbo.json` task inputs, expanding build outputs to include generated Prisma client files, moving library `.tsbuildinfo` files into ignored cache locations, and fixing root ignore files so the actual generated paths are ignored instead of stale paths.

Second, expand shared lint support beyond React packages. Add a Node/TypeScript ESLint config export in `packages/eslint-config`, create thin `eslint.config.js` wrappers for the API, contracts, and DB packages, and add `lint` scripts plus the minimal package dependencies needed for those workspaces to participate in root linting.

Third, make small frontend improvements that preserve behavior but reduce unnecessary work and ambiguity. Remove the redundant flashcard fetch from the SRS page, stop treating every session request failure as “logged out”, simplify Tailwind integration to the Vite plugin path, normalize a handful of extensionful imports, and add route-level lazy loading where it can reduce the initial bundle without changing URLs or page behavior.

Finally, remove stale generated DB artifacts that are already reproduced by the toolchain, run the repository validation commands, and record the results in this document.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Update this ExecPlan and keep the living sections current.
2. Edit root tooling and package config files.
3. Add non-React ESLint support and package wrappers.
4. Apply the small frontend refactors.
5. Remove stale generated DB files if they still exist:

      rm -f packages/db/prisma.config.js packages/db/src/client.js packages/db/src/index.js

6. Refresh workspace links and the lockfile if package metadata changed:

      pnpm install --no-frozen-lockfile

7. Validate:

      pnpm run lint
      pnpm run check-types
      pnpm run build

Observed result:

    pnpm install --no-frozen-lockfile
    pnpm run lint
    pnpm run check-types
    pnpm run build

The validation commands all succeeded. The root lint command now includes API/contracts/db, and the final Turbo dry-run confirmed that API and web build tasks exclude `dist/**` and `node_modules/**` from their hashed inputs.

## Validation and Acceptance

Acceptance is met when all of the following are true:

- `pnpm run lint` succeeds and includes `@advanced-quiz/api`, `@advanced-quiz/contracts`, and `@advanced-quiz/db`.
- `pnpm run check-types` succeeds.
- `pnpm run build` succeeds.
- `git status --short` no longer shows TypeScript build info files or the known generated DB JavaScript files as new workspace noise after validation.
- `pnpm turbo run build check-types lint --dry=json` no longer shows local `dist/**`, `.turbo/**`, or `node_modules/**` files as hashed task inputs.
- The SRS page source no longer fetches flashcards only for an empty-state check, and `useSession()` only converts expected auth failures into “no session”.

## Idempotence and Recovery

These edits are safe to repeat. Ignore-file and Turbo-input changes are configuration-only. ESLint config additions are additive. The web refactors do not change public routes or API payload shapes. If any validation command fails, the safe recovery path is to adjust only the affected workspace config or import path and rerun the validation command, rather than reverting unrelated in-flight changes elsewhere in the dirty worktree.

## Artifacts and Notes

Evidence gathered before implementation:

    $ pnpm run check-types
    turbo run check-types
    ...
    @advanced-quiz/contracts:build
    @advanced-quiz/db:build
    @advanced-quiz/web:build
    @advanced-quiz/api:build

    $ pnpm turbo run build check-types lint --dry=json
    ... task inputs include dist/**, .turbo/**, and node_modules/** files in the current worktree

    $ git status --short
    ?? packages/contracts/tsconfig.tsbuildinfo
    ?? packages/db/prisma.config.js
    ?? packages/db/src/client.js
    ?? packages/db/src/generated/
    ?? packages/db/src/index.js
    ?? packages/db/tsconfig.tsbuildinfo

Evidence after implementation:

    $ pnpm run lint
    ... Running lint in 7 packages
    ... @advanced-quiz/api:lint
    ... @advanced-quiz/contracts:lint
    ... @advanced-quiz/db:lint

    $ pnpm turbo run build check-types lint --dry=json
    {
      "apiBuildHasDistInput": false,
      "webBuildHasDistInput": false,
      "webBuildHasNodeModulesInput": false
    }

    $ pnpm run build
    ... dist/assets/index-tP01KZgu.js 624.73 kB
    ... dist/assets/home-page-BWH7nxjw.js 81.20 kB
    ... dist/assets/dashboard-page-Qc0cLRjp.js 14.89 kB
    ... dist/assets/collection-page-D0Hvxb2h.js 49.82 kB

## Interfaces and Dependencies

This pass continues to use the existing Turborepo, pnpm, Vite, NestJS, Prisma, and React Query stack. The new lint support should come from `@advanced-quiz/eslint-config` so configuration logic stays centralized rather than being copied into each workspace. The frontend route graph, API URLs, and shared `@advanced-quiz/contracts` package remain stable.

At the end of this pass, these interfaces should still exist:

- Root scripts in `package.json` that delegate through `turbo run ...`.
- Shared config exports from `packages/eslint-config`.
- The web route entrypoint exported by `apps/web-new/src/pages/app-routes.tsx`.
- The DB package exports `@advanced-quiz/db` and `@advanced-quiz/db/client`.

Revision note: created this plan after the monorepo audit to constrain the first implementation pass to meaningful, low-risk refactors that preserve the current behavior and developer workflow.
