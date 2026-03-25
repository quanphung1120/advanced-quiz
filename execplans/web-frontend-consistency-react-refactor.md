# Refactor Web Frontend Consistency Around Direct Imports and Leaner React State

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md) and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the frontend in `apps/web-new` will follow a more consistent module boundary style and a leaner React style. The app entry points and route layer will import concrete files instead of local barrel files, feature types will come from their defining modules instead of re-export hubs, and a few low-value memoization patterns will be removed. Someone reviewing or extending the frontend will be able to trace imports directly to the owning file and will not need to guess whether a symbol comes from a barrel, a page wrapper, or a feature root.

You can see the result by opening `apps/web-new/src/main.tsx`, `apps/web-new/src/pages/app-routes.tsx`, and the feature type imports under `apps/web-new/src/features/*`, then running the web typecheck and lint commands from the repository root. The user-visible behavior should stay the same, while the code becomes more predictable and easier to optimize.

## Progress

- [x] (2026-03-15 05:00Z) Read `PLANS.md`, inspected `apps/web-new/src`, and confirmed the requested cleanup is a substantial frontend refactor that needs an ExecPlan.
- [x] (2026-03-15 05:00Z) Audited the current inconsistency patterns: local barrel imports exist in `config/`, `context/`, `layouts/`, `pages/`, and `features/*`; route code mixes feature-root and direct-file imports; several type imports flow through `types/index.ts`; and a few simple values use `useMemo` without material benefit.
- [x] (2026-03-15 05:04Z) Replaced local barrel imports in the app shell and feature consumers with direct-file imports, then deleted the unused `index.ts` re-export files under `apps/web-new/src`.
- [x] (2026-03-15 05:04Z) Standardized feature type imports so modules now import from `types/chat.ts`, `types/collection.ts`, `types/flashcard.ts`, and `types/review.ts`, while auth API types now come directly from `@advanced-quiz/contracts`.
- [x] (2026-03-15 05:05Z) Added exact-path ESLint restrictions in `apps/web-new/eslint.config.js` to block only the barrel entry points, not legitimate direct subpath imports.
- [x] (2026-03-15 05:05Z) Removed the low-value `useMemo` calls for `initialEmail`, `token`, and `readinessLabel`.
- [x] (2026-03-15 05:06Z) Ran `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint`; both exited successfully after fixing one intermediate rule-scope issue and one `toSorted()` compatibility issue.

## Surprises & Discoveries

- Observation: The web workspace is already dirty before this refactor starts, including many files inside `apps/web-new/src`.
  Evidence: `git status --short apps/web-new` reports existing modified and deleted frontend files before new edits in this pass.

- Observation: The local barrel pattern is shallow and concentrated, which makes it practical to remove in one pass without changing application behavior.
  Evidence: `rg --files apps/web-new/src | rg '/index\\.ts$'` returns only 15 `index.ts` files, all of which are simple re-export hubs.

- Observation: The current route and entry code already import directly from most feature files; the inconsistency is mostly at the app shell boundary and in feature type modules.
  Evidence: `apps/web-new/src/main.tsx` imports `@/config`, `@/context`, and `@/pages`, while most dashboard and learn pages already import concrete files like `@/features/collections/hooks/use-collections`.

- Observation: `no-restricted-imports` `patterns` were too broad for this workspace and matched valid direct subpath imports such as `@/config/query-client` and `@/features/collections/hooks/use-collections`.
  Evidence: the first lint pass flagged 61 errors across valid direct imports until the rule was narrowed to exact `paths`.

- Observation: The current TypeScript target in `apps/web-new` does not support `Array.prototype.toSorted()`, even though some files already used it.
  Evidence: the first typecheck pass failed with `TS2550: Property 'toSorted' does not exist on type ...` in `chat-session-browser.tsx`, `chat-session-list.tsx`, and `dashboard-page.tsx`.

## Decision Log

- Decision: Scope this refactor around application-local barrels and simple React state cleanup, not around a broader visual redesign or route restructuring.
  Rationale: The user asked for frontend refactoring and code consistency, and the Vercel skill guidance most directly applies to barrel imports and lean render-time derivation here. A wider redesign would increase risk without directly addressing the inconsistency.
  Date/Author: 2026-03-15 / Codex

- Decision: Enforce the new import boundary with ESLint rather than relying only on manual cleanup.
  Rationale: The repository already has a shared React ESLint helper in `packages/eslint-config/react.js`, and `apps/web-new/eslint.config.js` can add workspace-specific rules cheaply. This turns the refactor into a durable convention.
  Date/Author: 2026-03-15 / Codex

- Decision: Keep behavior stable and avoid rewrites of existing query hooks, route semantics, or modal lifecycles unless required by the import cleanup.
  Rationale: The web workspace has unrelated in-flight changes, so the safest path is to improve consistency without broad behavioral churn.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

The refactor achieved the intended consistency pass without changing route behavior or feature flows. The web app entry points now import concrete files, the feature type graph no longer depends on local `types/index.ts` barrels, the redundant `index.ts` files under `apps/web-new/src` have been removed, and ESLint now blocks the old barrel entry points from being reintroduced. The auth and dashboard pages also no longer use `useMemo` for simple render-time values.

The main residual risk is the same one present at the start of the task: `apps/web-new` already had a dirty worktree with unrelated in-flight changes. This pass stayed scoped to import boundaries, type source ownership, lint enforcement, and a few small React render cleanups. Both `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint` now pass, which is the main evidence that the refactor remained behavior-preserving at the code health level.

## Context and Orientation

The frontend application lives in `apps/web-new/src`. The browser entry point is `apps/web-new/src/main.tsx`. It mounts the React Query provider, the theme provider, and the React Router route tree. The route tree is defined in `apps/web-new/src/pages/app-routes.tsx`. Shared shell components live in `apps/web-new/src/layouts/`. Domain-specific code lives under `apps/web-new/src/features/`, with separate folders for auth, collections, flashcards, chat, and reviews.

In this repository, a "barrel file" means an `index.ts` file that re-exports symbols from sibling modules. Examples include `apps/web-new/src/config/index.ts` and `apps/web-new/src/features/auth/index.ts`. Barrel files shorten import paths, but they also hide ownership and make it easier for route or app-shell code to depend on a whole folder instead of a specific module. For this refactor, "direct import" means importing the concrete file that owns the symbol, such as `@/config/query-client` instead of `@/config`.

The current inconsistencies are concentrated in these places:

- `apps/web-new/src/main.tsx` imports from local top-level barrels.
- `apps/web-new/src/pages/app-routes.tsx` imports `useAuth` from the feature root and `RootLayout` from the layouts root.
- `apps/web-new/src/features/*/types/index.ts` re-export type definitions from sibling files, and several consumers import from those index files instead of the defining module.
- `apps/web-new/src/features/auth/components/verify-email-page.tsx`, `apps/web-new/src/features/auth/components/reset-password-page.tsx`, and `apps/web-new/src/pages/dashboard/collection-page.tsx` use `useMemo` for simple values that can be derived inline during render.
- `apps/web-new/eslint.config.js` currently only forwards the shared config helper and does not enforce any workspace-specific import boundaries.

## Plan of Work

First, update the web app entry points to import concrete files. In `apps/web-new/src/main.tsx`, replace `@/config`, `@/context`, and `@/pages` imports with direct file imports. In `apps/web-new/src/pages/app-routes.tsx`, import `useAuth` from `features/auth/hooks/use-auth` and `RootLayout` from `layouts/root-layout`.

Next, standardize feature type imports. Any module that imports from `@/features/*/types` will be updated to import from the defining file instead, such as `@/features/collections/types/collection`, `@/features/flashcards/types/flashcard`, or `@/features/reviews/types/review`. The auth API client will import its types directly from `@advanced-quiz/contracts`, because the current `features/auth/types/index.ts` only re-exports contract types.

Then, delete the redundant local barrel files that no longer serve a purpose. This includes top-level barrels like `config/index.ts`, `context/index.ts`, `layouts/index.ts`, `pages/index.ts`, and feature-root barrels that only aggregate exports. If a type index remains necessary after the import sweep, it must be justified by an actual remaining consumer; otherwise it should be removed to keep the boundary explicit.

After the import cleanup, add workspace-specific ESLint restrictions in `apps/web-new/eslint.config.js`. The rule should reject imports from local directory roots like `@/config`, `@/context`, `@/layouts`, `@/pages`, and `@/features/*` where a direct-file import is expected. The message should explain that the web workspace uses direct-file imports to preserve ownership and avoid local barrel re-exports.

Finally, remove the low-value `useMemo` calls that are only wrapping simple query-param reads or a simple string label. `initialEmail`, `token`, and `readinessLabel` should be derived inline during render. After the edits, run the web typecheck and lint commands from the repository root and record the exact results in this plan.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Update the import sites in:

   - `apps/web-new/src/main.tsx`
   - `apps/web-new/src/pages/app-routes.tsx`
   - all consumers of `@/features/*/types`
   - `apps/web-new/src/features/auth/api/auth-client.ts`

2. Delete the redundant `index.ts` barrel files that have no remaining imports.

3. Edit `apps/web-new/eslint.config.js` to pass a `rules` object into `createReactConfig(...)` with `no-restricted-imports` patterns for local barrel imports.

4. Simplify the render-time derived values in:

   - `apps/web-new/src/features/auth/components/verify-email-page.tsx`
   - `apps/web-new/src/features/auth/components/reset-password-page.tsx`
   - `apps/web-new/src/pages/dashboard/collection-page.tsx`

5. Run:

      pnpm --filter @advanced-quiz/web check-types
      pnpm --filter @advanced-quiz/web lint

6. If either command fails, fix the reported import or typing issue in place and rerun the failed command until both succeed.

## Validation and Acceptance

Acceptance is satisfied when:

- `apps/web-new/src/main.tsx` and `apps/web-new/src/pages/app-routes.tsx` no longer import from app-local barrels such as `@/config`, `@/context`, `@/layouts`, `@/pages`, or `@/features/auth`.
- `rg -n 'from "@/features/.*/types"' apps/web-new/src` returns only direct file imports like `types/collection`, `types/flashcard`, or `types/review`, not directory-root imports.
- No redundant `index.ts` barrel files remain in `apps/web-new/src` unless an actual consumer still requires them and that use is documented here.
- `pnpm --filter @advanced-quiz/web check-types` succeeds.
- `pnpm --filter @advanced-quiz/web lint` succeeds.
- The user-visible routes and flows remain unchanged: the app still boots, auth routes still render, dashboard routes still guard behind auth, and learn pages still render their existing UI states.

Observed acceptance evidence:

- `rg --files apps/web-new/src | rg '/index\\.ts$'` now returns no results.
- `rg -n 'from "@/features/.*/types"' apps/web-new/src` returns no results.
- `pnpm --filter @advanced-quiz/web check-types` exited with status `0`.
- `pnpm --filter @advanced-quiz/web lint` exited with status `0`.

## Idempotence and Recovery

This refactor is safe to repeat because each step is an import-path rewrite or a deletion of a pure re-export file. If a deletion is attempted before all imports are updated, restore the missing import by pointing the consumer at the concrete file instead of recreating the barrel. Because the worktree is already dirty, recovery should avoid `git checkout` or other destructive resets; fix forward in place and keep unrelated user changes intact.

## Artifacts and Notes

Current evidence before edits:

    $ rg --files apps/web-new/src | rg '/index\.ts$'
    apps/web-new/src/utils/index.ts
    apps/web-new/src/context/index.ts
    apps/web-new/src/features/chat/index.ts
    apps/web-new/src/config/index.ts
    ...

    $ sed -n '1,20p' apps/web-new/src/main.tsx
    import { queryClient } from "@/config";
    import { ThemeProvider } from "@/context";
    import { AppRoutes } from "@/pages";

    $ sed -n '1,20p' apps/web-new/src/pages/app-routes.tsx
    import { useAuth } from "@/features/auth";
    import { RootLayout } from "@/layouts";

## Interfaces and Dependencies

No new dependencies are required. This refactor continues to use React, React Router, React Query, and the shared `@advanced-quiz/ui` package exactly as before.

At the end of the change, these interfaces must still exist in equivalent form:

- `AppRoutes` exported from `apps/web-new/src/pages/app-routes.tsx`
- `ThemeProvider` and `useTheme` exported from `apps/web-new/src/context/theme-provider.tsx`
- `RootLayout` exported from `apps/web-new/src/layouts/root-layout.tsx`
- `useAuth` exported from `apps/web-new/src/features/auth/hooks/use-auth.ts`
- Feature domain types defined in their specific files under `apps/web-new/src/features/*/types/*.ts`

Revision note: created this plan after auditing the current web frontend structure and before applying the direct-import and React cleanup pass.
Revision note: updated after implementation to record the deleted barrel files, the narrowed ESLint restriction strategy, the `toSorted()` compatibility fix, and the successful web verification commands.
