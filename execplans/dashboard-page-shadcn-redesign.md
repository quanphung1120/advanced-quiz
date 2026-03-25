# Redesign the dashboard page around local ShadCN dashboard patterns

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, authenticated users landing on `/dashboard` should see a dashboard that feels like a real workspace, not just a search input above a list. The page should use the local ShadCN component stack already present in this monorepo, borrow hierarchy from ShadCN dashboard examples, and still preserve the existing user actions: searching collections, opening a collection, and creating a new collection. A developer can verify the redesign by starting the web app, signing in, visiting `/dashboard`, and confirming that the page now shows summary cards, activity visualization, a recent-updates table, and sectioned collection cards built from shared UI primitives.

## Progress

- [x] (2026-03-13 04:44Z) Read `PLANS.md`, the existing dashboard page in `apps/web-new/src/pages/dashboard/dashboard-page.tsx`, and the shared UI primitives in `packages/ui/src/components`.
- [x] (2026-03-13 04:49Z) Queried the configured `@shadcn` registry through MCP and collected relevant examples and blocks, including `dashboard-01`, `sidebar-demo`, `chart-area-interactive`, `table-demo`, `empty-demo`, and `button-group-input-group`.
- [x] (2026-03-13 05:05Z) Rebuilt `apps/web-new/src/pages/dashboard/dashboard-page.tsx` into a composed dashboard page with summary cards, chart, recent activity table, tabs, and shared ShadCN search/empty/loading patterns.
- [x] (2026-03-13 05:07Z) Updated `apps/web-new/src/features/collections/components/collection-card.tsx` and `apps/web-new/src/features/collections/components/collection-empty-state.tsx` so the list section matches the new dashboard composition instead of mixing older custom markup.
- [x] (2026-03-13 05:18Z) Ran `pnpm --filter @advanced-quiz/web exec eslint src/pages/dashboard/dashboard-page.tsx src/features/collections/components/collection-card.tsx src/features/collections/components/collection-empty-state.tsx`, `pnpm --filter @advanced-quiz/web lint`, `pnpm --filter @advanced-quiz/web check-types`, and `pnpm --filter @advanced-quiz/ui check-types`; all passed after moving the `recharts` primitives behind the shared chart export.

## Surprises & Discoveries

- Observation: The dashboard shell had already been migrated to the shared sidebar primitives in an earlier local change, so the redesign scope is the page content itself rather than the app chrome.
  Evidence: `apps/web-new/src/layouts/dashboard-layout.tsx` already composes `SidebarProvider`, `Sidebar`, `SidebarInset`, and `SidebarTrigger`.

- Observation: The monorepo already exposes all primitives needed for the redesign through `@advanced-quiz/ui`, including `Chart`, `Empty`, `InputGroup`, `Table`, `Tabs`, `Badge`, and `Card`.
  Evidence: `rg --files packages/ui/src/components` includes `chart.tsx`, `empty.tsx`, `input-group.tsx`, `table.tsx`, `tabs.tsx`, `badge.tsx`, and `card.tsx`.

- Observation: The collections listing API only returns owned and shared collection arrays, so the dashboard analytics must be derived locally from timestamps and visibility flags instead of relying on a dedicated dashboard endpoint.
  Evidence: `apps/web-new/src/features/collections/api/collections-api.ts` exposes `list()` returning `ListCollectionsResponse` with `ownedCollections` and `sharedCollections`.

- Observation: Importing `recharts` directly from the web app fails because the dependency is available through the shared UI package but not the web workspace itself.
  Evidence: `pnpm --filter @advanced-quiz/web check-types` initially failed with `Cannot find module 'recharts'`, while `packages/ui/node_modules/recharts` already existed.

## Decision Log

- Decision: Keep the redesign inside the existing dashboard route and derive analytics from the current collections query rather than adding a new API contract.
  Rationale: The user asked for a frontend redesign following ShadCN patterns. A local derivation keeps the change fast, observable, and low risk while still making the page feel like a dashboard.
  Date/Author: 2026-03-13 / Codex

- Decision: Use the local shared component implementations instead of importing the public `dashboard-01` block directly.
  Rationale: The repository already has a `base-lyra` ShadCN setup and shared exports under `@advanced-quiz/ui/components/*`. Reusing those components preserves monorepo consistency and avoids importing a block authored against a different registry flavor.
  Date/Author: 2026-03-13 / Codex

- Decision: Redesign the supporting collection card and empty state in the same pass.
  Rationale: Leaving the old card and empty-state markup in place would produce an inconsistent page that mixes two unrelated UI systems. These components are only used by the dashboard list and are safe to adapt together.
  Date/Author: 2026-03-13 / Codex

- Decision: Re-export the required Recharts primitives from `packages/ui/src/components/chart.tsx` instead of adding a direct `recharts` import to the web app.
  Rationale: The dashboard already depends on the shared chart wrapper, and re-exporting the primitives keeps chart usage inside the design-system boundary while avoiding an extra app-level dependency edge.
  Date/Author: 2026-03-13 / Codex

## Outcomes & Retrospective

The dashboard page is now structured as a ShadCN-style workspace with a stronger information hierarchy. Users can still search, create, and open collections, but the page also summarizes totals, highlights recent activity, visualizes updates over time, and presents filtered results in clearer ownership groups. This better matches the intent of the request: redesign the dashboard using frontend-oriented skills and ShadCN examples, not just polish the previous list view.

Validation completed cleanly for the touched surfaces. `pnpm --filter @advanced-quiz/web lint`, `pnpm --filter @advanced-quiz/web check-types`, and `pnpm --filter @advanced-quiz/ui check-types` all passed after the shared chart module re-exported the needed Recharts primitives with explicit type annotations.

## Context and Orientation

The Vite frontend lives in `apps/web-new/src`. Route registration happens in `apps/web-new/src/pages/app-routes.tsx`, where `/dashboard` renders `DashboardPage` from `apps/web-new/src/pages/dashboard/dashboard-page.tsx` inside the authenticated dashboard layout. The layout shell itself is already shared and ShadCN-based, so this plan only changes what renders inside the page body.

The dashboard page consumes data through `useCollections()` from `apps/web-new/src/features/collections/hooks/use-collections.ts`. That hook calls `collectionsApi.list()` in `apps/web-new/src/features/collections/api/collections-api.ts`, which returns two arrays: `ownedCollections` and `sharedCollections`. Each collection includes `id`, `name`, `description`, `isPublic`, `createdAt`, and `updatedAt`. There is no backend dashboard summary endpoint, so counts, recency, and timeline data must be computed from these arrays on the client.

The shared UI library lives in `packages/ui/src/components`. The components relevant to this redesign are `card.tsx`, `badge.tsx`, `chart.tsx`, `empty.tsx`, `input-group.tsx`, `select.tsx`, `skeleton.tsx`, `table.tsx`, and `tabs.tsx`. They are imported in the web app through `@advanced-quiz/ui/components/*`.

## Plan of Work

Rewrite `apps/web-new/src/pages/dashboard/dashboard-page.tsx` so it no longer renders a simple header plus two list sections. Instead, compose the page from shared cards and dashboard sections inspired by the MCP examples: a top control card with search and actions, a compact workspace pulse card, a row of summary cards, a chart card for update activity, a table card for recent movement, and a tabbed collection browser for the actual deck cards.

Use the existing `useCollections()` response as the single source of truth. Build a local merged collection model that tags each record as `owned` or `shared`. Derive filter results, summary counts, a last-six-month timeline, and a recent-activity table from that merged array. Keep the existing `CollectionFormModal` integration so the “New collection” action still works without route changes.

Update `apps/web-new/src/features/collections/components/collection-card.tsx` to use full shared card composition, including `CardHeader`, `CardDescription`, `CardAction`, and `Badge`, so it matches the new dashboard surface. Update `apps/web-new/src/features/collections/components/collection-empty-state.tsx` to use the shared `Empty` primitive instead of a bespoke dashed box. Keep both components local to the collections feature because they still belong to the dashboard collection browsing flow.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `apps/web-new/src/pages/dashboard/dashboard-page.tsx` to compose the new dashboard from existing shared UI primitives and locally derived analytics.
2. Edit `apps/web-new/src/features/collections/components/collection-card.tsx` so cards align with the new dashboard treatment.
3. Edit `apps/web-new/src/features/collections/components/collection-empty-state.tsx` so empty results use the shared `Empty` component.
4. Run:

    pnpm --filter @advanced-quiz/web lint

5. Run:

    pnpm --filter @advanced-quiz/web check-types

6. Run:

    pnpm --filter @advanced-quiz/ui check-types

7. If command verification is clean enough, start the frontend for manual inspection:

    pnpm --filter @advanced-quiz/web dev

Expected observable result after implementation:

    - `/dashboard` opens with a summary-oriented dashboard rather than a plain list page.
    - Search still filters collections.
    - Clicking “New collection” still opens the existing modal.
    - Clicking a collection card or a row in the recent table still navigates to `/dashboard/collections/:id`.

## Validation and Acceptance

Acceptance is behavioral. After signing in and visiting `/dashboard`, the page should show a top dashboard surface with summary cards, an activity chart, and recent movement information before the collection browser. Typing into the search input should reduce both the recent table and the visible collection cards. Switching the ownership tabs should change the list scope without losing the rest of the dashboard context. Clicking “New collection” should open the collection modal. Clicking any collection card or recent item should navigate to the collection detail page.

Command validation should include `pnpm --filter @advanced-quiz/web lint`, `pnpm --filter @advanced-quiz/web check-types`, and `pnpm --filter @advanced-quiz/ui check-types`. Current status: all three commands passed after implementation.

## Idempotence and Recovery

This redesign is file-local to the frontend dashboard surface. Re-applying the plan is safe as long as the shared UI exports remain stable. If the redesign causes regressions, the safe rollback path is to restore `apps/web-new/src/pages/dashboard/dashboard-page.tsx`, `apps/web-new/src/features/collections/components/collection-card.tsx`, and `apps/web-new/src/features/collections/components/collection-empty-state.tsx` from version control, then re-run the filtered web lint and type-check commands.

## Artifacts and Notes

Reference artifacts used during design:

    - Local dashboard route: `apps/web-new/src/pages/dashboard/dashboard-page.tsx`
    - Shared dashboard shell: `apps/web-new/src/layouts/dashboard-layout.tsx`
    - Shared UI primitives: `packages/ui/src/components/{card,badge,chart,empty,input-group,select,skeleton,table,tabs}.tsx`
    - MCP examples and blocks: `dashboard-01`, `chart-area-interactive`, `table-demo`, `empty-demo`, `button-group-input-group`

## Interfaces and Dependencies

The redesign continues to depend on:

- `useCollections()` and `useCreateCollection()` from `apps/web-new/src/features/collections/hooks/use-collections.ts`
- `CollectionFormModal` from `apps/web-new/src/features/collections/components/collection-form-modal.tsx`
- shared UI exports from `@advanced-quiz/ui/components/*`
- `react-router` links for navigation
- `recharts` through the shared `ChartContainer` wrapper in `packages/ui/src/components/chart.tsx`

At the end of the work, `apps/web-new/src/pages/dashboard/dashboard-page.tsx` must still export:

    export function DashboardPage(): JSX.Element

Revision note: Created this plan at implementation time because the task is a substantial dashboard redesign and the repository requires ExecPlans for larger frontend refactors.

Revision note: Updated after verification to record the successful web lint, web type-check, and shared UI type-check runs, plus the chart re-export decision that kept `recharts` behind the shared UI boundary.
