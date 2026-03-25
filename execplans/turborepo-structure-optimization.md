# Optimize Turborepo workspace structure and shared configuration

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, the monorepo will have clearer workspace boundaries and less duplicated configuration. Shared TypeScript and ESLint settings will live in internal config packages under `packages/`, and the web app will stop resolving the UI library through a direct source alias. The observable outcome is that `pnpm run check-types` and `pnpm run lint` still pass, while the repository structure better matches Turborepo best practices for internal packages and package exports.

## Progress

- [x] (2026-03-10 09:45Z) Audited the current workspace graph, `turbo.json`, and package scripts.
- [x] (2026-03-10 09:45Z) Identified two structural issues to fix first: duplicated TS/ESLint config and the web app alias that points into `packages/ui/src`.
- [x] (2026-03-10 09:45Z) Created this ExecPlan and recorded the planned validation commands.
- [x] (2026-03-10 09:53Z) Implemented `packages/typescript-config` with shared base, library, React app, React library, Node app, and Node tooling presets.
- [x] (2026-03-10 09:53Z) Implemented `packages/eslint-config` and switched `apps/web-new` and `packages/ui` to thin wrapper configs.
- [x] (2026-03-10 09:53Z) Updated the existing workspaces to consume the shared config packages through workspace dependencies.
- [x] (2026-03-10 09:53Z) Removed the `@advanced-quiz/ui/* -> ../../packages/ui/src/*` alias from `apps/web-new`.
- [x] (2026-03-10 09:53Z) Refreshed workspace links with `CI=true pnpm install --no-frozen-lockfile`.
- [x] (2026-03-10 09:53Z) Ran `pnpm run check-types` successfully.
- [x] (2026-03-10 09:53Z) Ran `pnpm run lint` successfully.

## Surprises & Discoveries

- Observation: The repository already follows the `apps/` and `packages/` split, but internal configuration is still copied into multiple workspaces instead of being modeled as first-class packages.
  Evidence: `apps/web-new/eslint.config.js` and `packages/ui/eslint.config.js` are nearly identical, and every `tsconfig*.json` currently defines compiler options inline.

- Observation: The web app imports the UI library through package subpaths, but TypeScript still points `@advanced-quiz/ui/*` at `../../packages/ui/src/*`.
  Evidence: `apps/web-new/tsconfig.json` and `apps/web-new/tsconfig.app.json` both define that alias even though application code imports `@advanced-quiz/ui/components/*`.

- Observation: Adding new workspace packages required a lockfile and workspace-link refresh before TypeScript could resolve `extends` from the new config package.
  Evidence: The first `pnpm run check-types` failed with `TS6053: File '@advanced-quiz/typescript-config/library.json' not found`, and `pnpm install` then updated the links successfully.

- Observation: A React package preset for the shared UI library must not inherit `vite/client` types.
  Evidence: `packages/ui` does not depend on Vite, so the final structure uses a separate `react-library.json` preset while the web app uses `react-app.json`.

## Decision Log

- Decision: Scope this refactor to structural improvements that are low-risk and directly aligned with Turborepo guidance, instead of converting all shared libraries to compiled `dist/` outputs in one pass.
  Rationale: Converting the shared libraries to compiled packages would touch runtime packaging and CSS delivery. Centralized config packages and boundary cleanup improve the repo structure immediately without changing the application runtime model.
  Date/Author: 2026-03-10 / Codex

- Decision: Keep the shared libraries in a just-in-time TypeScript model for now.
  Rationale: The current apps and Vite/Nest toolchain already consume TypeScript sources successfully. The higher-value structural issue today is to ensure consumers import through package exports rather than direct filesystem aliases.
  Date/Author: 2026-03-10 / Codex

- Decision: Split the React TypeScript preset into `react-app.json` and `react-library.json`.
  Rationale: The web app needs Vite-specific types and stricter app-facing compiler options, while `packages/ui` should stay reusable without a Vite dependency.
  Date/Author: 2026-03-10 / Codex

## Outcomes & Retrospective

The repository now models shared repository configuration as first-class internal packages under `packages/`, which is more consistent with Turborepo package-structure guidance. TypeScript settings are centralized in `packages/typescript-config`, React lint setup is centralized in `packages/eslint-config`, and the frontend app no longer points TypeScript directly at `packages/ui/src`.

The change preserved the existing just-in-time package compilation model while removing an import-boundary smell and reducing duplicated config maintenance. The work was validated with `pnpm run check-types` and `pnpm run lint`, both of which succeeded after refreshing workspace links and the lockfile.

## Context and Orientation

This repository is a pnpm workspace and Turborepo monorepo rooted at `/home/lenovo/advanced-quiz`. Deployable applications live in `apps/`, specifically `apps/api-new` for the NestJS API and `apps/web-new` for the Vite React frontend. Shared libraries live in `packages/`, including `packages/config`, `packages/contracts`, `packages/db`, and `packages/ui`.

The Turborepo task graph is defined in `turbo.json`. Root scripts in `package.json` correctly delegate to `turbo run ...`, which already matches Turborepo best practice. The structural gaps are elsewhere. First, TypeScript settings are repeated in `apps/api-new/tsconfig.json`, `apps/web-new/tsconfig*.json`, `packages/config/tsconfig.json`, `packages/contracts/tsconfig.json`, `packages/db/tsconfig.json`, and `packages/ui/tsconfig.json`. Second, ESLint settings are duplicated between `apps/web-new/eslint.config.js` and `packages/ui/eslint.config.js`. Third, `apps/web-new` declares a path alias to `../../packages/ui/src/*`, which bypasses the package boundary concept even though the app code already imports the UI package through its `exports` subpaths.

In Turborepo terms, an internal config package is a workspace package whose job is to provide reusable repository configuration rather than application code. A package boundary means consumers should import another workspace package through the package name and its declared exports, not by reaching into the package directory on disk.

## Plan of Work

Create a new internal package at `packages/typescript-config` that exports base TypeScript configuration files for the repository. Define one base config for shared defaults, one library-oriented config for source-only packages under `packages/`, one React app config for `apps/web-new`, and one Node app config for `apps/api-new` and any Node-based tooling files. Then update every existing `tsconfig*.json` to extend one of those shared configs and retain only the workspace-specific settings such as `outDir`, `types`, `paths`, and `include`.

Create a new internal package at `packages/eslint-config` that exports a reusable flat-config builder for the React/Vite-style lint setup currently duplicated in `apps/web-new` and `packages/ui`. Then reduce each of those workspace `eslint.config.js` files to a small wrapper that imports the shared config and optionally adds local rule overrides.

Update `apps/web-new/tsconfig.json` and `apps/web-new/tsconfig.app.json` to remove the `@advanced-quiz/ui/*` path alias. Keep the local `@/*` alias for the app’s own source tree. This change must preserve typechecking and builds by relying on the `@advanced-quiz/ui` workspace dependency and its `exports` field.

If any Turbo task definitions need a small adjustment to match the new package layout, update `turbo.json` and root scripts conservatively. Avoid introducing root task logic or changing runtime behavior.

## Concrete Steps

Run the following commands from `/home/lenovo/advanced-quiz` as the work progresses:

    pnpm turbo run check-types --dry=json

Use the dry run output to confirm the current dependency graph and task relationships before editing.

    pnpm run check-types

This validates that the TypeScript config refactor still allows all workspaces to typecheck.

    pnpm run lint

This validates that the shared ESLint config package still works for the linted workspaces.

If TypeScript path resolution fails after removing the UI source alias, compare imports in `apps/web-new/src` against the subpath exports declared in `packages/ui/package.json` and fix the package exports rather than restoring direct filesystem aliases.

## Validation and Acceptance

Acceptance is met when all of the following are true:

`pnpm run check-types` succeeds for the workspace after the refactor.

`pnpm run lint` succeeds for the workspaces that define `lint` scripts, using the shared config package rather than duplicated inline ESLint setup.

`apps/web-new/tsconfig.json` and `apps/web-new/tsconfig.app.json` no longer contain a path alias that points into `../../packages/ui/src/*`.

The repository contains internal config packages under `packages/` for TypeScript and ESLint, and the existing app/library workspaces extend or consume them instead of duplicating the same base settings.

## Idempotence and Recovery

These changes are configuration-only and can be re-run safely. If a specific workspace fails typechecking after adopting a shared TypeScript config, restore only the missing workspace-specific compiler option in that workspace’s `tsconfig` rather than copying the full previous config back inline. If the new shared ESLint config causes a workspace-specific rule regression, keep the shared base and add the exception in that workspace wrapper file.

## Artifacts and Notes

Initial evidence gathered before implementation:

    turbo.json defines shared tasks and already uses package-level scripts.

    apps/web-new/eslint.config.js and packages/ui/eslint.config.js contain the same React, TypeScript, and Vite lint stack with only a minor rule difference.

    apps/web-new/tsconfig.json and apps/web-new/tsconfig.app.json both map @advanced-quiz/ui/* to ../../packages/ui/src/*.

## Interfaces and Dependencies

Define `packages/typescript-config/package.json` with `exports` entries for JSON config files such as `./base.json`, `./react-app.json`, `./node-app.json`, and `./library.json`. Each consuming workspace `tsconfig*.json` should use the standard TypeScript `extends` field to inherit from one of those exported configs.

Define `packages/eslint-config/package.json` with an exported JavaScript module, and implement a function that returns a flat ESLint config array for React TypeScript packages. `apps/web-new/eslint.config.js` and `packages/ui/eslint.config.js` should import that function and pass only local customizations.

Revision note: Created the initial ExecPlan after auditing the current Turbo workspace layout and choosing a low-risk structural optimization scope centered on config packages and package-boundary cleanup.

Revision note: Updated the ExecPlan after implementation to record the workspace-linking requirement, the React app vs. React library preset split, and the successful validation results.
