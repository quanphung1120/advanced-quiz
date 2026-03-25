# Standardize Web Loading States On Circular Spinners

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md) from the repository root and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the web app no longer shows skeleton placeholders while page data is loading. Instead, each page and dashboard surface shows a centered circular spinner that is visually larger and consistent across the app. A user can verify the change by opening dashboard, chat, collection, learn, and SRS routes and observing a single centered loading circle rather than placeholder bars.

## Progress

- [x] (2026-03-15 03:48Z) Audited current loading states across `apps/web-new/src` and confirmed skeleton-based loaders still exist in dashboard chat surfaces and route-level content loaders.
- [x] (2026-03-15 03:48Z) Added a shared centered loading-state component for the web app with a larger default spinner size and optional label support.
- [x] (2026-03-15 03:48Z) Replaced page and dashboard skeleton loaders with the shared circular loading state in dashboard, collection, learn, SRS, chat session browser, chat thread, and chat session list.
- [x] (2026-03-15 03:56Z) Removed the stale `Spinner` import left behind in `apps/web-new/src/layouts/dashboard-layout.tsx` after validation exposed it.
- [x] (2026-03-15 03:57Z) Ran `pnpm run check-types`, `pnpm run lint`, and `pnpm run dev:web`; typecheck and lint passed, and Vite booted successfully on `http://localhost:5174/` because port `5173` was already in use.

## Surprises & Discoveries

- Observation: The remaining skeleton loaders were concentrated in chat surfaces, while other page loaders had already drifted to bespoke pulse-box implementations.
  Evidence: `rg -n "@advanced-quiz/ui/components/skeleton|<Skeleton" apps/web-new/src`

- Observation: The dashboard navbar duplication bug from earlier work came from rendering `DashboardPageLayout` inside a suspense fallback, so route-level fallbacks must now render content-only loaders.
  Evidence: `apps/web-new/src/pages/app-routes.tsx` already renders dashboard routes inside a parent `DashboardPageLayout`.

- Observation: The first validation pass failed because `apps/web-new/src/layouts/dashboard-layout.tsx` still imported `Spinner` after migrating the layout loader to the shared component.
  Evidence: `src/layouts/dashboard-layout.tsx(48,1): error TS6133: 'Spinner' is declared but its value is never read.`

## Decision Log

- Decision: Introduce a single web-level loading component instead of repeating raw `Spinner` markup in every page.
  Rationale: This keeps the spinner size, centering, and optional label treatment consistent and makes future loading-state changes one edit instead of many.
  Date/Author: 2026-03-15 / Codex

- Decision: Keep route and page loaders content-only instead of re-rendering dashboard layout chrome inside fallbacks.
  Rationale: The layout already exists in the route tree. Re-rendering it in fallbacks caused duplicate navbar/sidebar output during suspense.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

The web app now uses one larger circular loading treatment across route fallbacks, dashboard loading branches, learn/SRS views, and chat surfaces. The visible result is simpler and more consistent than the previous mix of skeleton bars and custom pulse boxes. Validation passed after removing one stale import, and the web dev server still boots cleanly.

## Context and Orientation

The web frontend lives in `apps/web-new/src`. Route composition starts in `apps/web-new/src/pages/app-routes.tsx`. The dashboard shell lives in `apps/web-new/src/layouts/dashboard-layout.tsx`. The individual page components that still show loading placeholders are `apps/web-new/src/pages/dashboard/dashboard-page.tsx`, `apps/web-new/src/pages/dashboard/collection-page.tsx`, `apps/web-new/src/pages/learn/learn-page.tsx`, and `apps/web-new/src/pages/learn/srs-page.tsx`. The dashboard chat surfaces use `apps/web-new/src/features/chat/components/chat-session-browser.tsx`, `apps/web-new/src/features/chat/components/chat-thread.tsx`, and `apps/web-new/src/features/chat/components/chat-session-list.tsx`.

In this repository, a "skeleton" means a placeholder block that mimics future content structure while data is loading. A "spinner" means the circular animated `Spinner` icon from `packages/ui/src/components/spinner.tsx`. This work removes skeleton placeholders from the page surfaces above and standardizes them on a centered spinner presentation.

## Plan of Work

Create a reusable loading helper in `apps/web-new/src/components/loading-state.tsx`. It should render a centered circular spinner, default to a larger visual size than the previous page spinners, and optionally render a compact uppercase label underneath when a route wants explanatory text.

Replace every page-level or page-surface loading branch that currently renders skeletons or custom pulse boxes with that helper. Update `apps/web-new/src/pages/app-routes.tsx` route fallbacks, `apps/web-new/src/layouts/dashboard-layout.tsx`, `apps/web-new/src/pages/dashboard/dashboard-page.tsx`, `apps/web-new/src/pages/dashboard/collection-page.tsx`, `apps/web-new/src/pages/learn/learn-page.tsx`, `apps/web-new/src/pages/learn/srs-page.tsx`, `apps/web-new/src/features/chat/components/chat-session-browser.tsx`, `apps/web-new/src/features/chat/components/chat-thread.tsx`, and `apps/web-new/src/features/chat/components/chat-session-list.tsx` so they all consume the shared loader and remove direct skeleton imports.

After the refactor, run the workspace typecheck and lint commands from the repository root. If they pass, update this plan’s validation and retrospective sections with the exact results.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Create `apps/web-new/src/components/loading-state.tsx` with a centered loading wrapper around `@advanced-quiz/ui/components/spinner`.
2. Edit the route, layout, page, and chat component files listed above to replace skeleton or custom loading markup with the new shared component.
3. Run `pnpm run check-types`.
4. Run `pnpm run lint`.
5. Run `pnpm run dev:web` and confirm Vite starts successfully.

Expected successful validation transcript:

    > advanced-quiz@ check-types /home/lenovo/advanced-quiz
    > turbo run check-types
    ...
    Tasks:    7 successful, 7 total

    > advanced-quiz@ lint /home/lenovo/advanced-quiz
    > turbo run lint
    ...
    Tasks:    ... successful ...

    > advanced-quiz@ dev:web /home/lenovo/advanced-quiz
    > turbo run dev --filter=@advanced-quiz/web...
    ...
      VITE v6.4.1  ready in ...
      Local:   http://localhost:5174/

## Validation and Acceptance

Acceptance is visual and command-based. After starting the web app and visiting `/dashboard`, `/dashboard/chat`, `/dashboard/collections/:id`, `/learn/:id`, and `/learn/:id/srs`, each loading state should show a centered circular spinner instead of skeleton placeholder bars or pulse blocks. The spinner should be visibly larger than the old `size-6` and `size-10` uses. `pnpm run check-types` and `pnpm run lint` now pass from the repository root, and `pnpm run dev:web` starts Vite successfully.

## Idempotence and Recovery

These edits are safe to reapply because they only replace loading-state rendering and do not alter persisted data. If a loading branch breaks layout, revert only the affected file to the previous conditional rendering block and keep the shared loader component for the remaining routes.

## Artifacts and Notes

Key search commands used during the audit:

    rg -n "@advanced-quiz/ui/components/skeleton|<Skeleton" apps/web-new/src
    rg -n "Spinner className=|animate-spin rounded|Loading route" apps/web-new/src

Validation evidence:

    pnpm run check-types
    Tasks:    7 successful, 7 total

    pnpm run lint
    Tasks:    5 successful, 5 total

    pnpm run dev:web
    Port 5173 is in use, trying another one...
    VITE v6.4.1  ready in 248 ms
    Local:   http://localhost:5174/

## Interfaces and Dependencies

`apps/web-new/src/components/loading-state.tsx` must export a React component named `LoadingState` that accepts optional class names for the container and spinner plus an optional label string. It must depend on `@advanced-quiz/ui/components/spinner` for the animated icon and `@/utils` for class-name merging.

Revision note: Updated the plan after implementation and validation to record the stale-import fix, the successful command results, and the dev-server boot evidence so a future contributor can see the completed state and the one issue discovered during rollout.
