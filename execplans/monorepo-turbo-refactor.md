# Refine monorepo task boundaries and shared package hygiene

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, the monorepo should keep the same runtime behavior and developer commands while doing less unnecessary work. `pnpm run dev` should stop creating no-op `dev` tasks for library and config packages that do not actually run a development server. `pnpm run check-types` should stop forcing each app to run its own `build` first. Cache invalidation should be narrower so a web `.env` change does not invalidate unrelated package builds.

You can see the result by comparing Turbo dry-run output before and after the refactor, and by running the normal repository validation commands. The observable outcome is a smaller, cleaner task graph with the same top-level commands.

## Progress

- [x] (2026-03-15 06:02Z) Audited root workspace config, package manifests, shared config packages, and current dry-run task graphs for `build`, `check-types`, and `dev`.
- [x] (2026-03-15 06:06Z) Identified four concrete low-risk improvements: remove inherited no-op package tasks, narrow Turbo env/input scope to packages that truly need it, clean generated/tracked build noise, and remove duplicated ESLint plugin dependencies from wrappers.
- [x] (2026-03-15 06:10Z) Created this ExecPlan before editing repository files.
- [ ] (2026-03-15 06:10Z) Implement package-specific `turbo.json` files and tighten root task definitions.
- [ ] (2026-03-15 06:10Z) Clean package metadata and generated-file hygiene in `packages/typescript-config`, `packages/contracts`, and `packages/db`.
- [ ] (2026-03-15 06:10Z) Remove duplicated ESLint dependencies from `apps/web-new` and `packages/ui`.
- [ ] (2026-03-15 06:10Z) Run validation and record the before/after task-graph differences.

## Surprises & Discoveries

- Observation: the root `turbo.json` currently creates inherited tasks for packages that do not define matching scripts, including `@advanced-quiz/ui#build`, `@advanced-quiz/contracts#dev`, `@advanced-quiz/eslint-config#build`, and `@advanced-quiz/typescript-config#check-types`.
  Evidence: `pnpm turbo run build --dry=json`, `pnpm turbo run check-types --dry=json`, and `pnpm turbo run dev --dry=json --filter=@advanced-quiz/api... --filter=@advanced-quiz/web...` all report tasks whose command is `<NONEXISTENT>`.

- Observation: the root `check-types` task currently depends on both `build` and `^build`, which makes each package build itself before type-checking even when the local typecheck command already covers that package.
  Evidence: the dry run shows `@advanced-quiz/web#check-types` depending on `@advanced-quiz/web#build`, and `@advanced-quiz/api#check-types` depending on `@advanced-quiz/api#build`.

- Observation: environment-driven hash inputs are broader than necessary for build caching.
  Evidence: the root `build` task currently includes `DATABASE_URL`, `AUTH_SECRET`, `API_URL`, `WEB_URL`, `CORS_ORIGIN`, `VITE_API_URL`, and `VITE_CLOUDINARY_CLOUD_NAME`, so unrelated package builds inherit app-specific env sensitivity.

- Observation: generated or compiled artifacts are still present in tracked or easy-to-dirty source locations.
  Evidence: `packages/contracts/tsconfig.tsbuildinfo`, `packages/db/tsconfig.tsbuildinfo`, `packages/db/src/client.js`, `packages/db/src/index.js`, and `packages/db/prisma.config.js` exist even though the package source of truth is the `.ts` files and generated output already goes through build or Prisma generation.

## Decision Log

- Decision: keep the refactor focused on workspace orchestration, package metadata, and dependency hygiene rather than changing runtime architecture.
  Rationale: the repository already has unrelated in-flight feature work, so the safest high-value refactor is the one that reduces incidental complexity and wasted work without changing app behavior.
  Date/Author: 2026-03-15 / Codex

- Decision: use package-level `turbo.json` files to opt packages out of inherited tasks instead of adding more root-task branching.
  Rationale: Turborepo package configurations are the native way to exclude inherited tasks for packages that do not implement them, which keeps the root graph simple and package intent explicit.
  Date/Author: 2026-03-15 / Codex

- Decision: keep compiled-package boundaries for `@advanced-quiz/contracts` and `@advanced-quiz/db`, but stop requiring each package to run its own build before its own typecheck.
  Rationale: app and package consumers still rely on compiled outputs from those libraries, so removing all upstream build dependencies would be risky. Removing the same-package `build` prerequisite is the lower-risk performance win.
  Date/Author: 2026-03-15 / Codex

- Decision: treat duplicated ESLint plugin dependencies in `apps/web-new` and `packages/ui` as package-hygiene cleanup to do now.
  Rationale: those wrappers only import `@advanced-quiz/eslint-config/react`, so keeping plugin packages duplicated in every wrapper adds noise without improving clarity or runtime behavior.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

Implementation is in progress. This section will be updated after validation with the final task-graph changes, residual risks, and what was intentionally deferred.

## Context and Orientation

The repository root at `/home/lenovo/advanced-quiz` defines shared Turbo tasks in `turbo.json` and delegates commands through root `package.json`. Deployable apps live in `apps/api-new` and `apps/web-new`. Shared packages live in `packages/`, including three different kinds of workspaces:

`packages/contracts` and `packages/db` are compiled libraries. Their `package.json` files export `dist/*`, so downstream apps expect build output to exist before runtime.

`packages/ui` is a source-exported React library. Its `package.json` exports files directly from `src/`, so it does not need a build step to be consumed by the Vite app.

`packages/typescript-config` and `packages/eslint-config` are config-only packages. They exist to share configuration files and helper code; they are not deployable runtime libraries and should not participate in build or dev graphs unless they actually define those scripts.

In Turborepo terms, an inherited task is a task defined in the root `turbo.json` that every package receives by default. A package configuration file such as `packages/ui/turbo.json` can override or exclude inherited tasks for that package only. According to Turborepo’s package-configuration documentation, setting a task to `extends: false` excludes that task from the package entirely.

## Plan of Work

First, tighten the root `turbo.json` so global tasks only describe true cross-repo defaults. Remove the same-package `build` dependency from `check-types`, and move web-specific build env/input sensitivity out of the global `build` definition and into the web app package configuration. Keep `build` outputs at the root because compiled packages and apps still emit `dist/**`.

Second, add package-level `turbo.json` files to packages that should not inherit every root task. `packages/typescript-config` and `packages/eslint-config` should opt out of `build`, `check-types`, `lint`, and `dev` because they do not implement those scripts. `packages/ui` should opt out of `build` and `dev` because it exports source and has no long-running server. `packages/contracts` and `packages/db` should opt out of `dev` because they do not run development servers.

Third, clean the shared package metadata and generated-file hygiene. `packages/typescript-config/package.json` should explicitly export the config files it expects consumers to extend. `packages/contracts/tsconfig.json` and `packages/db/tsconfig.json` should place TypeScript build info under ignored cache locations instead of writing repository-root `.tsbuildinfo` files. Stale generated JavaScript duplicates in `packages/db/src` and `packages/db/prisma.config.js` should be removed so the TypeScript files remain the source of truth. `.gitignore` should match the actual generated-path layout under `packages/db/src/generated` and ignore TypeScript build-info files.

Fourth, simplify package manifests by removing ESLint plugin/config packages from `apps/web-new/package.json` and `packages/ui/package.json` when those packages are already provided by `@advanced-quiz/eslint-config`. Keep direct `eslint` dependencies in the wrappers so package-local `lint` scripts still have an explicit binary.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Compare the current task graph:

      pnpm turbo run build --dry=json
      pnpm turbo run check-types --dry=json
      pnpm turbo run dev --dry=json --filter=@advanced-quiz/api... --filter=@advanced-quiz/web...

2. Implement the package-specific Turbo configs and metadata cleanup described above.

3. Run repository validation:

      pnpm install
      pnpm run check-types
      pnpm run lint
      pnpm turbo run build --dry=json
      pnpm turbo run check-types --dry=json
      pnpm turbo run dev --dry=json --filter=@advanced-quiz/api... --filter=@advanced-quiz/web...

4. Confirm that the after-state no longer includes no-op tasks such as `@advanced-quiz/ui#build` or `@advanced-quiz/contracts#dev`, and that `@advanced-quiz/web#check-types` no longer depends on `@advanced-quiz/web#build`.

## Validation and Acceptance

Acceptance is met when all of the following are true:

- `pnpm run check-types` succeeds.
- `pnpm run lint` succeeds.
- The after-state dry run for `build` no longer includes config-only package build tasks whose command is `<NONEXISTENT>`.
- The after-state dry run for `dev` no longer includes no-op `dev` tasks for library/config packages.
- The after-state dry run for `check-types` no longer shows same-package `build` dependencies for packages that only need upstream compiled dependencies.
- Shared package metadata is clearer: `@advanced-quiz/typescript-config` explicitly exports its config files, and generated `.tsbuildinfo` files are no longer written to tracked package roots.

## Idempotence and Recovery

These changes are safe to repeat because they are configuration and cleanup changes. If a package-specific `turbo.json` excludes too much, remove only that package override and rerun the dry-run commands to verify the graph. If removing a generated JavaScript file reveals an unexpected runtime dependency, regenerate or restore only that file and document the dependency explicitly instead of reintroducing broad generated-file churn.

## Artifacts and Notes

Key pre-change evidence:

    $ pnpm turbo run build --dry=json
    ...
    "@advanced-quiz/eslint-config#build": { "command": "<NONEXISTENT>" }
    "@advanced-quiz/typescript-config#build": { "command": "<NONEXISTENT>" }
    "@advanced-quiz/ui#build": { "command": "<NONEXISTENT>" }

    $ pnpm turbo run check-types --dry=json
    ...
    "@advanced-quiz/web#check-types": {
      "dependencies": [
        ...
        "@advanced-quiz/web#build"
      ]
    }

    $ pnpm turbo run dev --dry=json --filter=@advanced-quiz/api... --filter=@advanced-quiz/web...
    ...
    "@advanced-quiz/contracts#dev": { "command": "<NONEXISTENT>" }
    "@advanced-quiz/ui#dev": { "command": "<NONEXISTENT>" }

## Interfaces and Dependencies

This refactor keeps the following interfaces stable:

- Root scripts in `package.json` remain `turbo run ...` delegators.
- `@advanced-quiz/contracts` and `@advanced-quiz/db` continue exporting compiled `dist` artifacts.
- `@advanced-quiz/ui` continues exporting source subpaths from `src/`.
- `apps/api-new` continues to build with Nest CLI and `apps/web-new` continues to build with `tsc -b && vite build`.

New configuration files should be added at:

- `apps/web-new/turbo.json`
- `packages/contracts/turbo.json`
- `packages/db/turbo.json`
- `packages/eslint-config/turbo.json`
- `packages/typescript-config/turbo.json`
- `packages/ui/turbo.json`

Revision note: created this ExecPlan after dry-run auditing showed wasted no-op tasks, overly broad hash inputs, and generated-file hygiene issues that can be fixed without changing runtime behavior.
