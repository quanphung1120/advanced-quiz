# Refactor Web Frontend Into Domain-Oriented `src` Structure

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md) and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, `apps/web-new/src` will match a clearer frontend structure that separates shared building blocks from page routing and feature-specific code. Someone new to the web app will be able to find route pages under `pages/`, shared layout shells under `layouts/`, providers under `context/`, infrastructure clients under `config/`, and helper functions under `utils/`, while feature modules continue to own their domain logic under `features/`.

You can see the result by opening the `apps/web-new/src` tree and by running the existing web typecheck and lint commands. The application behavior should remain the same, but the source tree and import graph should now reflect the requested organization.

## Progress

- [x] 2026-03-11 05:32Z Read `PLANS.md`, inspected `apps/web-new/src`, and confirmed this is a substantial frontend refactor that needs an ExecPlan.
- [x] 2026-03-11 05:32Z Mapped the current structure: route screens live under `routes/`, shared infra lives under `lib/`, the theme provider lives under `components/`, and dashboard layout code is split between `components/layout/` and `routes/dashboard/`.
- [x] 2026-03-11 05:36Z Moved shared frontend infrastructure into `config/`, `context/`, `layouts/`, `pages/`, and `utils/`, then removed the empty legacy `lib/` and `routes/` directories.
- [x] 2026-03-11 05:37Z Added feature `index.ts` barrel files plus `types/` modules for auth, collections, flashcards, and reviews to separate domain types from API transport files.
- [x] 2026-03-11 05:37Z Updated all web imports and the `main.tsx` entry point to the new locations, including the route table and dashboard page-layout wrapper.
- [x] 2026-03-11 05:38Z Ran `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint`; both exited successfully.

## Surprises & Discoveries

- Observation: The `apps/web-new` worktree is already dirty, including files inside the refactor scope.
  Evidence: `git status --short apps/web-new` shows modified auth, collection, flashcard, route, config, and TypeScript files before this refactor begins.

- Observation: The current `src` tree already uses feature folders for most domain code, so the refactor can stay low-risk by relocating only shared infrastructure and route-layer files.
  Evidence: `find apps/web-new/src -maxdepth 3 -type d | sort` shows `features/auth`, `features/collections`, `features/flashcards`, and `features/reviews` already in place.

- Observation: Separating feature types into `types/` folders removed the remaining imports that treated API modules as the source of truth for domain models.
  Evidence: after the refactor, `rg -n "type .* from \"@/features/.*/api/" apps/web-new/src` returns no matches.

## Decision Log

- Decision: Keep the refactor behavior-preserving and avoid rewriting feature internals unless required by import fallout.
  Rationale: The user asked for the frontend to follow a new folder structure, not for a redesign or logic rewrite. The worktree also contains in-flight changes that should not be destabilized.
  Date/Author: 2026-03-11 / Codex

- Decision: Move `lib/api-client.ts`, `lib/cloudinary.ts`, and `lib/query-client.ts` into `config/`, but move `lib/utils.ts` into `utils/`.
  Rationale: The first three files define application-level clients and environment-backed setup, while `utils.ts` is a pure helper module and fits the requested helper-function bucket better.
  Date/Author: 2026-03-11 / Codex

- Decision: Move route components from `routes/` into `pages/`, and move the reusable dashboard shell from `components/layout/` into `layouts/`.
  Rationale: This matches the requested distinction between routing components and page layout components without changing how React Router works.
  Date/Author: 2026-03-11 / Codex

- Decision: Keep feature UI and hooks inside `features/*` and add barrel files rather than flattening feature code into the new top-level folders.
  Rationale: The repository already uses a feature-first domain layout successfully. The requested structure is best satisfied by reorganizing shared app-level concerns while preserving domain ownership inside `features/`.
  Date/Author: 2026-03-11 / Codex

- Decision: Extract the inline `RootLayout` from the route table into `apps/web-new/src/layouts/root-layout.tsx` and rename the dashboard route wrapper export to `DashboardPageLayout`.
  Rationale: This makes the route module primarily a router declaration and avoids confusion between the reusable dashboard shell and the route-layer layout wrapper.
  Date/Author: 2026-03-11 / Codex

## Outcomes & Retrospective

The refactor achieved the requested top-level organization without changing the route URLs or feature behavior. Shared clients now live in `config/`, the theme provider lives in `context/`, route-mounted screens live in `pages/`, reusable shells live in `layouts/`, and helper functions live in `utils/`. Feature directories remain domain-owned and now expose small barrels and dedicated `types/` folders.

The main residual risk is not from this refactor itself but from the already-dirty web workspace, which still contains unrelated user changes and deletions outside the moved paths. The web workspace typecheck and lint both passed after the restructure, which is the main proof that the import graph still holds.

## Context and Orientation

The web application lives in `apps/web-new/src`. The current entry point is `apps/web-new/src/main.tsx`, which mounts the theme provider from `context/`, the React Query provider using the client from `config/`, and the router exported from `pages/app-routes.tsx`. Route screen components now live in `apps/web-new/src/pages/`, while reusable shells live in `apps/web-new/src/layouts/`.

In this repository, a "page" means a React component that is mounted directly by React Router for a URL. A "layout" means a reusable shell component that wraps page content with shared navigation or structure. A "provider" means a React Context component that stores state for descendants, such as the current theme. A "feature" means a domain-focused module such as auth, collections, flashcards, or reviews that owns its own API calls, hooks, UI, and types.

The refactor relocated the main shared files to:

- `apps/web-new/src/config/api-client.ts`
- `apps/web-new/src/config/cloudinary.ts`
- `apps/web-new/src/config/query-client.ts`
- `apps/web-new/src/utils/cn.ts`
- `apps/web-new/src/context/theme-provider.tsx`
- `apps/web-new/src/layouts/dashboard-layout.tsx`
- `apps/web-new/src/layouts/root-layout.tsx`
- `apps/web-new/src/pages/app-routes.tsx`

The requested target structure is:

- `apps/web-new/src/assets/`
- `apps/web-new/src/components/`
- `apps/web-new/src/config/`
- `apps/web-new/src/context/`
- `apps/web-new/src/features/`
- `apps/web-new/src/hooks/`
- `apps/web-new/src/layouts/`
- `apps/web-new/src/pages/`
- `apps/web-new/src/utils/`

The repo already uses the `@/*` TypeScript path alias mapped to `apps/web-new/src/*`, so moving files inside `src` only requires import updates.

## Plan of Work

First, create the target top-level folders that do not already exist and move the shared infrastructure files into them. `api-client.ts`, `cloudinary.ts`, and `query-client.ts` move from `lib/` to `config/`. The `cn` helper in `lib/utils.ts` moves to `utils/`. The theme provider moves from `components/` to `context/`, and the reusable dashboard shell moves from `components/layout/` to `layouts/`.

Next, move the route table and route components into `pages/`. `routes.tsx` becomes `pages/app-routes.tsx`, and the current `routes/dashboard/*`, `routes/learn/*`, and `routes/home-page.tsx` files move into `pages/` while preserving the existing route URLs. The small route wrapper currently in `routes/dashboard/dashboard-layout.tsx` becomes `pages/dashboard/dashboard-layout-page.tsx`, separate from the reusable shell in `layouts/`.

Then, add small `index.ts` barrel files for the existing feature folders so domain exports are easier to consume from the new `pages/` layer. Where types are currently imported from an API module purely for typing, create `types/` modules inside the affected feature and update imports to use them. This keeps domain types independent from transport files. This work is complete in `features/auth`, `features/collections`, `features/flashcards`, and `features/reviews`.

Finally, update imports across `apps/web-new/src`, delete any empty legacy folders that are no longer needed, run the web verification commands, and record the exact results in this plan. This step is complete.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Create or populate this ExecPlan and keep the living sections current during the refactor.
2. Move shared files into the requested folders under `apps/web-new/src/`.
3. Move route files from `apps/web-new/src/routes/` and `apps/web-new/src/routes.tsx` into `apps/web-new/src/pages/`.
4. Add feature `index.ts` files and any needed `types/` modules.
5. Update imports throughout `apps/web-new/src`.
6. Run:

      pnpm --filter @advanced-quiz/web check-types
      pnpm --filter @advanced-quiz/web lint

Completed move summary:

- `apps/web-new/src/lib/api-client.ts` -> `apps/web-new/src/config/api-client.ts`
- `apps/web-new/src/lib/cloudinary.ts` -> `apps/web-new/src/config/cloudinary.ts`
- `apps/web-new/src/lib/query-client.ts` -> `apps/web-new/src/config/query-client.ts`
- `apps/web-new/src/lib/utils.ts` -> `apps/web-new/src/utils/cn.ts`
- `apps/web-new/src/components/theme-provider.tsx` -> `apps/web-new/src/context/theme-provider.tsx`
- `apps/web-new/src/components/layout/dashboard-layout.tsx` -> `apps/web-new/src/layouts/dashboard-layout.tsx`
- `apps/web-new/src/routes.tsx` -> `apps/web-new/src/pages/app-routes.tsx`
- `apps/web-new/src/routes/home-page.tsx` -> `apps/web-new/src/pages/home-page.tsx`
- `apps/web-new/src/routes/dashboard/*` -> `apps/web-new/src/pages/dashboard/*`
- `apps/web-new/src/routes/learn/*` -> `apps/web-new/src/pages/learn/*`

## Validation and Acceptance

Acceptance is satisfied when:

- `find apps/web-new/src -maxdepth 1 -type d | sort` shows the requested top-level folders, including `components`, `config`, `context`, `features`, `layouts`, `pages`, and `utils`.
- No active imports still point at removed legacy paths such as `@/lib/...`, `@/routes/...`, `@/components/theme-provider`, or `@/components/layout/dashboard-layout`.
- `pnpm --filter @advanced-quiz/web check-types` succeeds.
- `pnpm --filter @advanced-quiz/web lint` succeeds.
- The route table still mounts the same pages for `/`, `/sign-in`, `/sign-up`, `/dashboard`, `/dashboard/collections/:id`, `/learn/:id`, and `/learn/:id/srs`.

Observed acceptance evidence:

- `find apps/web-new/src -maxdepth 1 -type d | sort` now returns `assets`, `components`, `config`, `context`, `features`, `hooks`, `layouts`, `pages`, and `utils`.
- `rg -n "@/lib/|@/routes/|@/components/theme-provider|@/components/layout/dashboard-layout" apps/web-new/src` returns no matches.
- Both verification commands exited with status code `0`.

## Idempotence and Recovery

This refactor is safe to repeat as long as each move is followed by an import sweep before deleting old paths. If a command fails after files move, fix the reported imports in place rather than trying to revert the dirty worktree. If a folder becomes empty after the move, it can be removed safely; if another in-flight change still depends on it, leave the folder in place until verification passes.

## Artifacts and Notes

Initial repo evidence:

    $ git status --short apps/web-new
     M apps/web-new/src/main.tsx
     M apps/web-new/src/routes/home-page.tsx
     ...

Current top-level source folders before the refactor:

    apps/web-new/src
    apps/web-new/src/components
    apps/web-new/src/features
    apps/web-new/src/lib
    apps/web-new/src/routes

Top-level source folders after the refactor:

    apps/web-new/src
    apps/web-new/src/assets
    apps/web-new/src/components
    apps/web-new/src/config
    apps/web-new/src/context
    apps/web-new/src/features
    apps/web-new/src/hooks
    apps/web-new/src/layouts
    apps/web-new/src/pages
    apps/web-new/src/utils

Verification transcript after the refactor:

    $ pnpm --filter @advanced-quiz/web check-types
    > @advanced-quiz/web@0.0.1 check-types /home/lenovo/advanced-quiz/apps/web-new
    > tsc -b

    $ pnpm --filter @advanced-quiz/web lint
    > @advanced-quiz/web@0.0.1 lint /home/lenovo/advanced-quiz/apps/web-new
    > eslint .

## Interfaces and Dependencies

No new dependencies are needed. This refactor continues to use:

- React and React Router for page composition
- React Query through the existing query client
- Axios through the existing API client
- `@advanced-quiz/ui` for shared UI primitives
- The `@/*` TypeScript alias already configured in `apps/web-new/tsconfig.json`

At the end of the refactor, these module-level interfaces must still exist in equivalent form:

- A top-level route component exported for the app entry point
- A theme provider component that exposes `useTheme()`
- A dashboard layout shell that can wrap children and accept `isLoading?: boolean`
- Existing feature hooks such as `useAuth`, `useCollections`, `useFlashcards`, and `useSrsSession`

Revision note: created this plan before code moves so the repository context, intended directory mapping, and validation steps are explicit.
Revision note: updated after implementation to record the completed file moves, the new feature type/barrel pattern, and the successful web verification commands.
