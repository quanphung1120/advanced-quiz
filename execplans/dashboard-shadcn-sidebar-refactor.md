# Refactor the dashboard shell onto the shared ShadCN sidebar components

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, authenticated users should see the dashboard inside the shared ShadCN sidebar shell instead of the current custom off-canvas layout. The sidebar should collapse cleanly on desktop, open as a sheet on mobile, keep the dashboard pages mounted inside a `SidebarInset`, and expose the same core actions that exist today: navigation, theme switching, and sign-out. A developer can verify the change by starting the web app, signing in, opening `/dashboard`, toggling the sidebar on desktop and mobile, and confirming that `/dashboard` and `/dashboard/collections/:id` both render inside the new shell without layout regressions.

## Progress

- [x] (2026-03-13 02:28Z) Read [PLANS.md](../PLANS.md), the current dashboard shell in `apps/web-new/src/layouts/dashboard-layout.tsx`, the dashboard route structure, and the shared ShadCN sidebar implementation in `packages/ui/src/components/sidebar.tsx`.
- [x] (2026-03-13 02:28Z) Queried the configured ShadCN registry through MCP and collected sidebar composition examples (`sidebar-demo`, `sidebar-07`, `sidebar-16`) to guide the refactor.
- [x] (2026-03-13 02:32Z) Replaced the bespoke dashboard shell with a composition built from `SidebarProvider`, `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarInset`, `SidebarTrigger`, and related shared UI primitives.
- [x] (2026-03-13 02:32Z) Preserved existing dashboard behavior inside the new shell, including route-aware navigation, authenticated user info, theme control, loading state, and collection detail pages.
- [x] (2026-03-13 02:32Z) Ran `pnpm --filter @advanced-quiz/web lint`; it passed, including a targeted run against `src/layouts/dashboard-layout.tsx`.
- [x] (2026-03-13 02:36Z) Adjusted the new sidebar to follow the default MCP sidebar examples more closely by removing the extra AQ brand mark and switching desktop collapse from icon mode to full off-canvas hide.
- [x] (2026-03-13 02:39Z) Rebalanced the shell layout so the study tip sits near the footer, the theme toggle lives in the top header/navbar, and the header chrome spans the full app width instead of using the content container width.
- [ ] (2026-03-13 02:32Z) Resolve or isolate the repository-wide `pnpm --filter @advanced-quiz/web check-types` failures. The command still fails because the web app already has broad alias and NodeNext import-resolution errors outside this refactor.

## Surprises & Discoveries

- Observation: The repository already ships a shared `sidebar.tsx` inside `packages/ui/src/components`, so this task is a shell migration rather than a dependency-install task.
  Evidence: `rg --files packages/ui/src | rg '/components/.+\\.(tsx|ts)$'` returned `packages/ui/src/components/sidebar.tsx`.

- Observation: The local ShadCN project uses the `base-lyra` style, which means composition APIs follow Base UI conventions rather than the `asChild` patterns shown in some registry examples.
  Evidence: `packages/ui/components.json` sets `"style": "base-lyra"` and the local component implementations use `@base-ui/*`.

- Observation: The shared sidebar provider writes a cookie but does not read it back on initial render, so SPA persistence must be controlled from the dashboard shell if we want deterministic collapse state after refresh.
  Evidence: `packages/ui/src/components/sidebar.tsx` defines `SidebarProvider` with an internal `defaultOpen` state and only writes `document.cookie` inside `setOpen`.

- Observation: The repository-level web type check is already failing far outside the dashboard shell, primarily because the current web project mixes unresolved `@/` aliases with NodeNext-style extension requirements.
  Evidence: `pnpm --filter @advanced-quiz/web check-types` fails in many existing files such as `src/main.tsx`, `src/pages/app-routes.tsx`, `src/features/auth/index.ts`, and `src/utils/index.ts`, including errors like `Cannot find module '@/config'` and `Relative import paths need explicit file extensions`.

- Observation: The simplest way to make the sidebar disappear completely on collapse is to use the shared component's default off-canvas behavior, which matches the MCP `sidebar-demo` example better than the icon-collapse block.
  Evidence: The MCP `sidebar-demo` example renders `<Sidebar>` without `collapsible="icon"`, and the local `packages/ui/src/components/sidebar.tsx` defaults `collapsible` to `"offcanvas"`.

- Observation: The sidebar content area already uses a vertical flex column, so placing the study tip group on `mt-auto` is enough to pin it above the footer without adding custom positioning.
  Evidence: `packages/ui/src/components/sidebar.tsx` defines `SidebarContent` with `flex min-h-0 flex-1 flex-col`, which lets lower groups consume remaining vertical space naturally.

## Decision Log

- Decision: Rebuild the dashboard shell around the existing shared ShadCN sidebar components instead of importing a full registry block into the app.
  Rationale: The shared UI package already contains the sidebar primitive and the app already imports shared ShadCN components from `@advanced-quiz/ui/components/*`, so reusing those primitives preserves the monorepo boundary and avoids drifting from the local design system.
  Date/Author: 2026-03-13 / Codex

- Decision: Adapt registry examples manually to the local `base-lyra` component APIs rather than copying them verbatim.
  Rationale: The MCP examples are useful for structure, but they are authored against the Radix-flavored registry output and use `asChild`; the local components are Base UI based and require API-compatible composition.
  Date/Author: 2026-03-13 / Codex

- Decision: Keep the scope centered on the dashboard shell and route chrome rather than rewriting the internal collection and flashcard pages.
  Rationale: The user asked for a sidebar-component refactor. The existing page content can stay intact as long as it fits inside the new shell and remains functional.
  Date/Author: 2026-03-13 / Codex

- Decision: Use the shared sidebar's default off-canvas collapse behavior instead of icon collapse for the dashboard.
  Rationale: The user explicitly asked for the sidebar to hide completely when collapsed, and the ShadCN MCP default sidebar examples (`sidebar-demo`, `sidebar-01`) align with that behavior.
  Date/Author: 2026-03-13 / Codex

- Decision: Move the theme switcher into the top header and let the header span full width, while keeping the page content constrained separately.
  Rationale: This matches the user's requested information hierarchy better: global UI controls belong in the navbar, while the document/content container remains narrower for readability.
  Date/Author: 2026-03-13 / Codex

## Outcomes & Retrospective

The dashboard shell now uses the shared ShadCN sidebar primitives instead of the custom `framer-motion` sidebar. The new layout keeps the authenticated dashboard pages inside `SidebarInset`, adds a sticky ShadCN-style header with a route-aware breadcrumb, preserves desktop collapse and mobile sheet behavior through `SidebarProvider`, and moves theme/sign-out controls into the sidebar footer. This satisfies the original purpose of migrating the dashboard chrome onto the local design system rather than maintaining a bespoke shell.

The main remaining gap is repository-wide TypeScript verification. `pnpm --filter @advanced-quiz/web lint` succeeded, but `pnpm --filter @advanced-quiz/web check-types` is still blocked by pre-existing module-resolution issues unrelated to this change. The refactor nevertheless clarified an important local rule: registry examples must be treated as structural guides only, because this monorepo uses the Base UI flavored `base-lyra` components and not the Radix-flavored `asChild` API shown in many public ShadCN block examples.

## Context and Orientation

The dashboard UI lives in the Vite SPA under `apps/web-new/src`. Route registration is in `apps/web-new/src/pages/app-routes.tsx`. Authenticated dashboard routes are wrapped by `DashboardPageLayout` from `apps/web-new/src/pages/dashboard/dashboard-layout-page.tsx`, which currently renders the custom shell from `apps/web-new/src/layouts/dashboard-layout.tsx`. The shared design system lives in `packages/ui/src/components`. This refactor should keep the page routes unchanged and only swap the dashboard layout implementation and any helper components it needs.

The current custom shell manually manages a fixed desktop sidebar, a mobile animated sidebar, and a header toggle button. It uses raw buttons, `framer-motion`, and hard-coded spacing. The target shell should instead use the shared sidebar primitives from `packages/ui/src/components/sidebar.tsx`, which already handle desktop collapsing and mobile sheet behavior. Important exports there are `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarSeparator`, `SidebarRail`, `SidebarInset`, `SidebarTrigger`, and `useSidebar`.

The shared UI package also exposes supporting primitives that match the desired layout: `Avatar` for user identity, `DropdownMenu` for footer actions, `Breadcrumb` for the sticky header, `Button` and `Separator` for controls, and `Badge` if small status markers are needed. Styling tokens for the sidebar already exist in `apps/web-new/src/globals.css`, where `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, and related variables are declared for light and dark themes.

The route content that must continue to work after the refactor is currently in `apps/web-new/src/pages/dashboard/dashboard-page.tsx` and `apps/web-new/src/pages/dashboard/collection-page.tsx`. Those pages should remain mounted via `<Outlet />` inside the new sidebar shell, and their loading state should still work when `RequireAuth` renders `DashboardPageLayout` with `isLoading={true}`.

## Plan of Work

Edit `apps/web-new/src/layouts/dashboard-layout.tsx` so it becomes a ShadCN-composed shell instead of a custom animated sidebar. Remove `framer-motion` and the manual mobile sidebar logic. Introduce small helper components inside that file if doing so keeps the change localized: one for the sidebar navigation menu, one for the account/footer menu, and one for the sticky dashboard header. Drive active state from `react-router` location so the current dashboard route is visibly active.

Wrap the layout in `SidebarProvider` and `SidebarInset`. Use `Sidebar` with `collapsible="icon"` so desktop users can collapse to icons, matching the registry pattern from `sidebar-07`. Use a sticky header structure inspired by `sidebar-07` and `sidebar-16`: a `SidebarTrigger`, a `Separator`, and a breadcrumb-like label derived from the current route. Keep the dashboard content inside the inset body and preserve the existing centered max-width container around page content.

Preserve current user-facing actions by moving sign-out and theme switching into shared ShadCN primitives. The footer should display the current user identity with `Avatar` and a dropdown menu for theme and sign-out actions. If the theme toggle remains the existing `ModeToggle`, place it in a sidebar group or dropdown item in a way that fits the shared shell.

If the local sidebar provider needs controlled state for persistence, read the existing `sidebar-collapsed` value once on mount and pass the resulting `open` state to `SidebarProvider`. That keeps collapse behavior stable in this client-rendered app, because the provider itself only writes cookies and does not hydrate initial state from them.

Create or update any small route-title helper needed to map `/dashboard` to “Collections” and `/dashboard/collections/:id` to “Collection”. Keep the implementation simple and local to the layout unless a broader routing abstraction becomes clearly necessary.

Finally, run the web type checker and linter from the repository root using filtered `pnpm` commands. Record any required cleanup in this file before considering the work complete.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `apps/web-new/src/layouts/dashboard-layout.tsx` to replace the custom animated shell with shared ShadCN sidebar composition and route-aware header/footer helpers.
2. Keep the write scope local to the layout unless a helper extraction becomes necessary. In the completed implementation, the helper pieces remain inside `dashboard-layout.tsx`.
3. Run:

    pnpm --filter @advanced-quiz/web check-types

4. Run:

    pnpm --filter @advanced-quiz/web lint

5. Start the app for manual verification if needed:

    pnpm --filter @advanced-quiz/web dev

Observed validation signals:

    - `pnpm --filter @advanced-quiz/web lint` exited successfully.
    - `pnpm --filter @advanced-quiz/web exec eslint src/layouts/dashboard-layout.tsx` exited successfully.
    - `pnpm --filter @advanced-quiz/web check-types` still fails because of existing project-wide alias and NodeNext import-resolution errors unrelated to this refactor.
    - Manual browser verification remains the final step for confirming `/dashboard` and `/dashboard/collections/:id` behavior in the new shell.

## Validation and Acceptance

Acceptance is behavioral, not just structural. In the browser, signing in and visiting `/dashboard` should show the new sidebar shell immediately. Clicking the trigger in the header should collapse and expand the desktop sidebar. On a narrow viewport, the same trigger should open the mobile sheet sidebar. Navigating from `/dashboard` to `/dashboard/collections/:id` should keep the same shell while updating the page title/breadcrumb context. Signing out from the sidebar footer should redirect the user to `/sign-in`.

Validation status at the end of this implementation:

    - `pnpm --filter @advanced-quiz/web lint`: passed.
    - `pnpm --filter @advanced-quiz/web exec eslint src/layouts/dashboard-layout.tsx`: passed.
    - `pnpm --filter @advanced-quiz/web check-types`: failed because of existing unrelated project-wide TypeScript/module-resolution errors.

## Idempotence and Recovery

This refactor is file-local to the web app shell, so repeating the edits is safe as long as the shared UI package imports remain stable. If the new shell introduces a regression, the safe recovery path is to restore `apps/web-new/src/layouts/dashboard-layout.tsx` to the prior implementation from version control and re-run the web type checker and linter. No database migrations or persistent data changes are involved.

## Artifacts and Notes

Reference artifacts gathered during design:

    - Local sidebar primitive: `packages/ui/src/components/sidebar.tsx`
    - Route wrapper: `apps/web-new/src/pages/dashboard/dashboard-layout-page.tsx`
    - Dashboard routes: `apps/web-new/src/pages/app-routes.tsx`
    - MCP registry examples used for layout composition: `sidebar-demo`, `sidebar-07`, `sidebar-16`

## Interfaces and Dependencies

The implementation should continue using:

- `react-router` for route location and navigation.
- `@advanced-quiz/ui/components/sidebar` for all sidebar shell primitives.
- `@advanced-quiz/ui/components/dropdown-menu`, `avatar`, `breadcrumb`, `button`, and `separator` for supporting chrome.
- The existing auth client in `apps/web-new/src/features/auth/api/auth-client.ts` for session loading and sign-out.
- The existing theme control in `apps/web-new/src/components/mode-toggle.tsx` unless the refactor exposes a clearer shared equivalent.

At the end of this work, `apps/web-new/src/layouts/dashboard-layout.tsx` must still export:

    export function DashboardLayout({
      children,
      isLoading = false,
    }: PropsWithChildren<{ isLoading?: boolean }>): JSX.Element

Revision note: Created this plan at implementation start to comply with the repository ExecPlan requirement and to capture the local ShadCN adaptation constraints before editing the dashboard shell.

Revision note: Updated after implementation to record the completed shell migration, the successful lint verification, and the unrelated repository-wide TypeScript failures blocking full `check-types`.

Revision note: Updated after follow-up refinement to align collapse behavior more closely with the ShadCN MCP default sidebar examples and to remove the extra AQ brand mark from the sidebar header.

Revision note: Updated after layout refinement to move the theme control into the full-width header and anchor the study tip closer to the footer using the sidebar's flex column behavior.
