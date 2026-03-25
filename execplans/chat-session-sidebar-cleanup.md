# Refine dashboard chat session navigation and composer styling

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, the dashboard chat UI should feel visually consistent with the main `/dashboard` page instead of looking like a special decorative surface. The sidebar should show only the five most recent chat session titles, while a dedicated session list page should expose the full session history with search. The message composer should no longer sit inside an extra rounded shell outside the actual `PromptInput`. A user can verify the result by opening `/dashboard/chat`, checking that the sidebar shows five compact title-only items, opening the full session list, using the search field, and confirming that the composer feels like one clean control instead of nested rounded containers.

## Progress

- [x] (2026-03-14 15:32Z) Read `PLANS.md`, the frontend-design skill guidance, the dashboard shell, the current chat route, and the relevant chat components and hooks under `apps/web-new/src/features/chat`.
- [x] (2026-03-14 15:32Z) Confirmed the current implementation still shows preview and timestamp metadata in the sidebar session list and wraps the composer with an extra `ComposerDock` container.
- [x] (2026-03-14 15:36Z) Added the dedicated `/dashboard/chat/sessions` route, updated dashboard breadcrumb/title handling, and prevented that route from being interpreted as a session id.
- [x] (2026-03-14 15:36Z) Reworked the chat sidebar so it shows only five recent session titles plus `New chat` and `Show all` actions.
- [x] (2026-03-14 15:36Z) Built the searchable full session list page in `apps/web-new/src/features/chat/components/chat-session-browser.tsx`.
- [x] (2026-03-14 15:37Z) Simplified the chat thread, conversation, and prompt input styling so the page uses flatter borders and removes the extra rounded composer shell outside `PromptInput`.
- [x] (2026-03-14 15:37Z) Ran targeted ESLint across the touched chat/dashboard files and `pnpm --filter @advanced-quiz/web check-types`; both passed.

## Surprises & Discoveries

- Observation: The current route table only has `/dashboard/chat` and `/dashboard/chat/:id`, so a dedicated session list page requires either a new route or a query-param-based mode.
  Evidence: `apps/web-new/src/pages/app-routes.tsx` only maps those two chat paths.

- Observation: The current `ChatSessionList` component is reused inside the dashboard sidebar and includes relative time and preview copy, which is more detailed than the user wants for the sidebar itself.
  Evidence: `apps/web-new/src/features/chat/components/chat-session-list.tsx` renders title, relative update timestamp, and preview text for each session.

- Observation: The existing dashboard layout treated every chat route as a full-height thread surface, which would have made the new session archive page feel out of place.
  Evidence: `apps/web-new/src/layouts/dashboard-layout.tsx` previously used one chat-route check to decide both sidebar behavior and full-height thread layout.

## Decision Log

- Decision: Add a dedicated route for the full session list instead of overloading `/dashboard/chat` with another query-param mode.
  Rationale: A route gives the “show all” destination a stable URL, avoids mixing blank-chat and full-session-list states in one component, and keeps breadcrumb/title handling explicit.
  Date/Author: 2026-03-14 / Codex

- Decision: Treat “5 nearest” as the five most recently updated sessions sorted by `updatedAt`.
  Rationale: That is the clearest and most useful interpretation for chat history in this product, and the session data already exposes `updatedAt`.
  Date/Author: 2026-03-14 / Codex

- Decision: Keep the full session archive inside the chat section sidebar but render its main content with the standard dashboard page width instead of the thread canvas.
  Rationale: The archive behaves like an index page, not a live conversation, so it should visually align with `/dashboard` while still keeping chat navigation visible.
  Date/Author: 2026-03-14 / Codex

- Decision: Flatten the composer and prompt suggestion surfaces into bordered dashboard-style sections instead of rounded cards.
  Rationale: The user explicitly asked for a sharper, cleaner interface with less card usage and no extra rounded form outside the `PromptInput`.
  Date/Author: 2026-03-14 / Codex

## Outcomes & Retrospective

The chat section now matches the main dashboard style more closely. The sidebar is lighter and more functional: it shows only five recent session titles, keeps a simple `New chat` action, and provides a `Show all` entry into the full archive. The new `/dashboard/chat/sessions` page gives the user a complete searchable history without forcing that bulk navigation into the sidebar itself.

The conversation surface is also cleaner. The prompt composer no longer sits inside an additional rounded outer shell, and the empty state plus session transcript now use flatter borders and simpler spacing. The result is less ornamental and more consistent with the existing collections dashboard.

Validation succeeded for the touched frontend scope. The targeted ESLint command passed, and `pnpm --filter @advanced-quiz/web check-types` also passed.

## Context and Orientation

The authenticated dashboard shell lives in `apps/web-new/src/layouts/dashboard-layout.tsx` and is mounted by `apps/web-new/src/pages/dashboard/dashboard-layout-page.tsx`. Dashboard routes are declared in `apps/web-new/src/pages/app-routes.tsx`. The chat feature lives in `apps/web-new/src/features/chat`.

The existing chat route page is `apps/web-new/src/pages/dashboard/chat-page.tsx`. The main conversation layout and composer live in `apps/web-new/src/features/chat/components/chat-thread.tsx`. The sidebar session list lives in `apps/web-new/src/features/chat/components/chat-session-list.tsx`. Session data comes from `apps/web-new/src/features/chat/hooks/use-chat-sessions.ts`, which reads the list from the existing backend API.

In this repository, “sidebar” means the dashboard’s persistent left navigation rail built from the shared components in `@advanced-quiz/ui/components/sidebar`. “PromptInput” means the shared AI input primitive from `@advanced-quiz/ui/components/ai-elements/prompt-input`. The user request to remove the rounded form outside the `PromptInput` means that any extra wrapper that visually looks like an outer input shell should be removed, leaving the actual prompt element as the only visible composer surface.

## Plan of Work

First, update routing so chat has a stable full-history destination such as `/dashboard/chat/sessions`. Then update `apps/web-new/src/layouts/dashboard-layout.tsx` so chat route detection, breadcrumb labeling, and active-session parsing recognize that route. The sidebar should keep the existing workspace navigation but replace the detailed recent-chat cards with a compact list that renders only five recent session titles and includes a clear “Show all” action to reach the session list page.

Next, split the current chat session list presentation into two modes. The sidebar mode should be minimal and title-only. The full-page mode should look like the rest of the dashboard: flat section header, search control, and a clean bordered list rather than a stack of oversized cards. Search should filter the full fetched session list client-side by title and preview text so no API changes are needed.

Finally, simplify `apps/web-new/src/features/chat/components/chat-thread.tsx`, `chat-conversation.tsx`, and `chat-prompt-input.tsx`. Keep the AI message flow intact, but remove any extra outer rounded composer treatment and reduce ornamental surfaces so the page feels more like the collections dashboard. After coding, run targeted linting and the web type-check command, then update this plan with the observed results.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `apps/web-new/src/pages/app-routes.tsx` to add a full-session-list chat route.
2. Edit `apps/web-new/src/layouts/dashboard-layout.tsx` to:
   - detect the new route,
   - avoid treating `sessions` as a session id,
   - render only five recent session titles in the sidebar,
   - add a “Show all” action for the full session list page.
3. Edit or add chat page components so `/dashboard/chat/sessions` shows the searchable full session list and `/dashboard/chat` continues to represent a blank new-thread surface.
4. Edit `apps/web-new/src/features/chat/components/chat-thread.tsx`, `chat-conversation.tsx`, and `chat-prompt-input.tsx` to remove the extra outer composer shell and flatten the visual treatment.
5. Run:

    pnpm --filter @advanced-quiz/web exec eslint src/pages/app-routes.tsx src/layouts/dashboard-layout.tsx src/pages/dashboard/chat-page.tsx src/pages/dashboard/chat-sessions-page.tsx src/features/chat/components/chat-thread.tsx src/features/chat/components/chat-conversation.tsx src/features/chat/components/chat-prompt-input.tsx src/features/chat/components/chat-session-list.tsx src/features/chat/components/chat-session-browser.tsx

   Observed result:

       The command exited successfully with no reported lint errors.

6. Run:

    pnpm --filter @advanced-quiz/web check-types

   Observed result:

       The command exited successfully.

## Validation and Acceptance

Acceptance is behavioral. After implementation:

- `/dashboard/chat` should show the blank or active conversation workspace, not the full session archive.
- The dashboard sidebar on chat routes should show no more than five recent sessions, each displaying only the session title.
- Clicking the full-history action should open a dedicated session list page that includes a search field or search button and shows the full session history in a cleaner dashboard-aligned list.
- The composer at the bottom of a chat thread should no longer appear inside an extra rounded outer form container.
- The updated files should pass the targeted lint and web type-check commands unless unrelated pre-existing issues block them, in which case those issues must be recorded.

## Idempotence and Recovery

This plan changes only frontend routing and presentational React components. No database or API schema changes are involved. Re-applying the edits is safe. If a regression appears, the safe recovery path is to restore the touched frontend files from version control and re-run the lint command listed above.

## Artifacts and Notes

Key files for this work:

- `apps/web-new/src/pages/app-routes.tsx`
- `apps/web-new/src/layouts/dashboard-layout.tsx`
- `apps/web-new/src/pages/dashboard/chat-page.tsx`
- `apps/web-new/src/pages/dashboard/chat-sessions-page.tsx`
- `apps/web-new/src/features/chat/components/chat-thread.tsx`
- `apps/web-new/src/features/chat/components/chat-conversation.tsx`
- `apps/web-new/src/features/chat/components/chat-prompt-input.tsx`
- `apps/web-new/src/features/chat/components/chat-session-list.tsx`
- `apps/web-new/src/features/chat/components/chat-session-browser.tsx`

## Interfaces and Dependencies

This work should keep using:

- `react-router` for dashboard routing and navigation
- `@tanstack/react-query` through the existing chat hooks
- `@advanced-quiz/ui/components/sidebar` for dashboard shell layout
- `@advanced-quiz/ui/components/input-group` and other existing shared UI primitives for the searchable full session list page
- `@advanced-quiz/ui/components/ai-elements/prompt-input` for the chat composer

The public exports that must remain valid after this refactor are:

- `ChatPage` from `apps/web-new/src/pages/dashboard/chat-page.tsx`
- `DashboardLayout` from `apps/web-new/src/layouts/dashboard-layout.tsx`
- `ChatThread` from `apps/web-new/src/features/chat/components/chat-thread.tsx`

Revision note: Created at implementation start because refining the chat shell, sidebar history treatment, and searchable session archive is a substantial dashboard UI refactor covered by the repository ExecPlan requirement.

Revision note: Updated after implementation to record the new session archive route, the five-item title-only sidebar history, the flatter chat composer treatment, and the passing frontend validation commands.
