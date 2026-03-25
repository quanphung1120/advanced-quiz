# Refactor Web Frontend Boundaries And React Consistency

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md) and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, `apps/web-new/src` will follow one consistent frontend boundary model: React Router routes will load only `pages/*` modules, shared code will be imported through direct file paths rather than barrels, and React Query keys plus simple derived values will follow one predictable pattern across features. Someone new to the frontend will be able to trace a route from `pages/app-routes.tsx` into a concrete page file without hopping through feature barrels, and maintainers will not have to guess whether a symbol should come from an `index.ts` shortcut or a direct module.

You can see the result by opening the `apps/web-new/src/pages` tree, confirming there are dedicated auth page modules, checking that barrel `index.ts` files are gone from the web source tree, and running the existing web typecheck and lint commands successfully.

## Progress

- [x] 2026-03-15 05:01Z Read `PLANS.md`, inspected `apps/web-new/src`, and confirmed this is a significant frontend refactor that requires an ExecPlan.
- [x] 2026-03-15 05:01Z Audited the current inconsistency patterns: top-level and feature barrel imports in hot paths, auth routes bypassing the `pages/` layer, repeated inline React Query keys, and unnecessary `useMemo` for simple primitives.
- [ ] 2026-03-15 05:01Z Implement the boundary refactor: add auth route page modules under `pages/auth`, replace barrel imports with direct file imports, and remove unused web barrel files.
- [ ] 2026-03-15 05:01Z Standardize React Query key creation and remove trivial memoization patterns that only wrap primitive reads or labels.
- [ ] 2026-03-15 05:01Z Run `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint`, then record the exact outcome here.

## Surprises & Discoveries

- Observation: The recent structural refactor introduced many new `index.ts` barrel files even though the repository guidelines prefer explicit imports.
  Evidence: `apps/web-new/src/config/index.ts`, `apps/web-new/src/context/index.ts`, `apps/web-new/src/layouts/index.ts`, `apps/web-new/src/pages/index.ts`, and multiple `features/*/index.ts` files all re-export the underlying modules.

- Observation: The route layer currently violates the repository's own `pages/` convention for auth screens.
  Evidence: `apps/web-new/src/pages/app-routes.tsx` lazy-loads `@/features/auth/components/sign-in-page` and related feature component files directly instead of page modules under `apps/web-new/src/pages/`.

- Observation: Only a small number of barrel imports are active in the current code, so removing them is practical in one pass.
  Evidence: `rg -n 'from "@/config"|from "@/context"|from "@/layouts"|from "@/pages"|from "@/utils"|from "@/features/auth"|from "@/features/.+/types"' apps/web-new/src` returns a short list concentrated in `main.tsx`, `app-routes.tsx`, shared components, and feature type imports.

## Decision Log

- Decision: Treat barrel removal as an enforcement mechanism, not just a style preference, by updating imports and deleting the corresponding `index.ts` files inside `apps/web-new/src`.
  Rationale: The most reliable way to remove this inconsistency is to make direct file imports the only working path. This aligns with the repository guidance to prefer explicit imports and the Vercel `bundle-barrel-imports` rule.
  Date/Author: 2026-03-15 / Codex

- Decision: Add auth page wrapper modules under `apps/web-new/src/pages/auth/` so every route in `pages/app-routes.tsx` resolves through the page layer.
  Rationale: The current route file mixes page modules and feature component modules. Small page wrappers preserve behavior while restoring a clean route-to-page boundary.
  Date/Author: 2026-03-15 / Codex

- Decision: Introduce feature-local React Query key helpers instead of continuing to repeat literal tuple arrays inline.
  Rationale: Query keys are currently duplicated across hooks and invalidation paths. A shared helper per feature keeps cache behavior consistent and reduces accidental mismatches during future edits.
  Date/Author: 2026-03-15 / Codex

- Decision: Only remove memoization where the derived value is a simple primitive or a one-time URL parameter read.
  Rationale: The Vercel guidance warns against `useMemo` for cheap expressions. This plan avoids speculative rewrites of the larger collection/session filtering logic unless the code clearly benefits from change.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

This refactor is still in progress. The intended outcome is a frontend that keeps route files, page files, feature modules, and shared utilities in clearly separated layers, with no dependency on convenience barrels inside the web app. The expected secondary improvement is easier React Query maintenance because cache keys will live in one obvious place per feature.

The main risk is the already-dirty `apps/web-new` worktree. The implementation must stay behavior-preserving and avoid touching unrelated user changes outside the boundary cleanup and query-key standardization.

## Context and Orientation

The web application lives in `apps/web-new/src`. The entry point is `apps/web-new/src/main.tsx`, which mounts the theme provider, React Query provider, and router. The router definition is in `apps/web-new/src/pages/app-routes.tsx`. In this repository, a "page" means a React component mounted directly by React Router for a URL, while a "feature" means a domain module such as auth, collections, flashcards, reviews, or chat that owns API calls, hooks, and UI.

The recent frontend restructure created a clean top-level folder layout, but it also left several `index.ts` barrel files in place. A barrel file is a module that re-exports symbols from sibling files so callers can import a directory path instead of a concrete file path. In this codebase, those barrels now exist in `config/`, `context/`, `layouts/`, `pages/`, `utils/`, and several `features/*` folders. The active imports are few, but they create inconsistent boundaries because some files use shortcuts such as `@/config` while others import the concrete file directly.

Another inconsistency exists in the route layer. `apps/web-new/src/pages/app-routes.tsx` already lazy-loads route modules from `pages/` for home, dashboard, and learn routes, but auth routes still import feature component modules directly from `features/auth/components/*`. This makes the `pages/` folder only partially true as the routing boundary.

React Query is used in feature hooks such as `apps/web-new/src/features/collections/hooks/use-collections.ts`, `apps/web-new/src/features/flashcards/hooks/use-flashcards.ts`, `apps/web-new/src/features/reviews/hooks/use-srs-session.ts`, `apps/web-new/src/features/chat/hooks/use-chat-sessions.ts`, and `apps/web-new/src/features/auth/api/auth-client.ts`. Today, each file repeats literal query key arrays inline. The refactor will replace those literals with feature-local key helpers so queries and invalidations always refer to the same tuple creator.

## Plan of Work

First, add page wrapper modules for the auth routes under `apps/web-new/src/pages/auth/`. Each wrapper will export the feature-owned auth screen component so `pages/app-routes.tsx` can lazy-load only from `pages/*`. Update the router to import `useAuth` directly from its hook file and `RootLayout` directly from `layouts/root-layout.tsx`.

Next, sweep the web source tree for active barrel imports and replace them with direct file imports. This includes `main.tsx`, shared components that import `cn` or the theme provider, route modules that import layout barrels, and any type imports that currently rely on `features/*/types/index.ts`. After the import sweep, delete unused barrel files under `apps/web-new/src`, including the top-level shared barrels and feature barrels that no longer serve a purpose.

Then, add feature-local query key helpers such as `query-keys.ts` files inside auth, chat, collections, flashcards, and reviews. Update all query and invalidation calls to use those helpers so cache keys stay aligned between reads and mutations.

Finally, remove clearly unnecessary `useMemo` wrappers for primitive values such as the auth token, verify-email initial email, and the collection readiness label. Keep the larger list-filtering memoization intact unless typecheck or lint reveals a better local cleanup is needed.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Create and maintain this ExecPlan while implementing the refactor.
2. Add `apps/web-new/src/pages/auth/sign-in-page.tsx`, `sign-up-page.tsx`, `verify-email-page.tsx`, `forgot-password-page.tsx`, and `reset-password-page.tsx` as route-level wrapper modules.
3. Update `apps/web-new/src/pages/app-routes.tsx` to lazy-load only page modules and to use direct imports for `useAuth` and `RootLayout`.
4. Replace active barrel imports throughout `apps/web-new/src` with direct file imports.
5. Add feature-local query key helpers and update hooks or API modules to use them.
6. Remove obsolete barrel files from `apps/web-new/src`.
7. Run:

      pnpm --filter @advanced-quiz/web check-types
      pnpm --filter @advanced-quiz/web lint

## Validation and Acceptance

Acceptance is satisfied when:

- `apps/web-new/src/pages/app-routes.tsx` lazy-loads every route component from `apps/web-new/src/pages/**` rather than from `features/**`.
- `rg -n 'from "@/config"|from "@/context"|from "@/layouts"|from "@/pages"|from "@/utils"|from "@/features/auth"|from "@/features/.+/types"' apps/web-new/src` returns no matches.
- `find apps/web-new/src -name 'index.ts' | sort` no longer shows the web barrel files removed by this refactor.
- Query hooks and invalidations use shared key helpers instead of repeating literal arrays inline.
- `pnpm --filter @advanced-quiz/web check-types` succeeds.
- `pnpm --filter @advanced-quiz/web lint` succeeds.

## Idempotence and Recovery

This work is safe to repeat if you update imports before deleting a barrel file. If typecheck fails after a barrel deletion, restore the missing import path by editing the caller to the concrete file path rather than recreating the barrel. The query-key helpers are additive and can be introduced feature by feature; if one feature breaks, keep the helper file and finish updating the remaining callers instead of reverting the pattern.

Because the `apps/web-new` worktree is already dirty, do not revert unrelated changes. Limit edits to the files named in this plan and to any import sites or type references required by those changes.

## Artifacts and Notes

Initial evidence for the active barrel-import problem:

    $ rg -n 'from "@/config"|from "@/context"|from "@/layouts"|from "@/pages"|from "@/utils"|from "@/features/auth"|from "@/features/.+/types"' apps/web-new/src
    apps/web-new/src/main.tsx:5:import { queryClient } from "@/config";
    apps/web-new/src/main.tsx:6:import { ThemeProvider } from "@/context";
    apps/web-new/src/main.tsx:7:import { AppRoutes } from "@/pages";
    apps/web-new/src/pages/app-routes.tsx:4:import { useAuth } from "@/features/auth";
    apps/web-new/src/pages/app-routes.tsx:5:import { RootLayout } from "@/layouts";
    ...

Initial evidence for the inconsistent route boundary:

    $ sed -n '1,80p' apps/web-new/src/pages/app-routes.tsx
    const SignInPage = lazy(() =>
      import("@/features/auth/components/sign-in-page").then((module) => ({
        default: module.SignInPage,
      })),
    );

## Interfaces and Dependencies

No new dependencies are needed. This refactor continues to use React, React Router, React Query, Axios, and the existing `@advanced-quiz/ui` package.

At the end of the refactor, these interfaces must still exist in equivalent form:

- `apps/web-new/src/main.tsx` must render the same provider stack and router behavior.
- `apps/web-new/src/pages/app-routes.tsx` must continue to expose `AppRoutes`.
- Each auth route module under `apps/web-new/src/pages/auth/` must export the corresponding page component used by the router.
- Feature hooks such as `useCollections`, `useFlashcards`, `useSrsSession`, `useChatSessions`, and `useSession` must keep their current public behavior while switching to shared query key helpers.

Revision note: created this plan before code changes so the boundary cleanup, route-layer alignment, and cache-key standardization are explicit and can be resumed from this file alone.
