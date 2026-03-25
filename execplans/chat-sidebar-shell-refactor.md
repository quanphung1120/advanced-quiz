# Refactor dashboard chat into a sidebar-driven assistant workspace

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, `/dashboard/chat` should feel like a dedicated assistant workspace instead of a dashboard card. The session list will live in the Dashboard sidebar, the conversation will fill the page body, and the prompt composer will stay anchored to the bottom of the viewport area even when the dashboard sidebar is collapsed or opened on mobile. A user can verify the result by signing in, opening `/dashboard/chat`, creating or selecting a session from the sidebar, collapsing and expanding the dashboard navigation, and confirming that the conversation area behaves like a ChatGPT or Claude-style interface rather than a boxed panel.

## Progress

- [x] (2026-03-14 14:54Z) Read `PLANS.md`, the frontend-design skill instructions, the dashboard shell in `apps/web-new/src/layouts/dashboard-layout.tsx`, and the current chat feature files under `apps/web-new/src/features/chat`.
- [x] (2026-03-14 14:54Z) Confirmed the dashboard already uses the shared sidebar provider and that chat currently renders a separate session rail inside `apps/web-new/src/pages/dashboard/chat-page.tsx`.
- [x] (2026-03-14 15:07Z) Updated `apps/web-new/src/layouts/dashboard-layout.tsx` so chat routes use the Dashboard sidebar for recent sessions and switch the main content area to a full-height chat mode.
- [x] (2026-03-14 15:10Z) Refactored `apps/web-new/src/pages/dashboard/chat-page.tsx` and `apps/web-new/src/features/chat/components/chat-thread.tsx` so `/dashboard/chat` behaves like a blank assistant canvas and the first submitted prompt creates a session automatically.
- [x] (2026-03-14 15:12Z) Restyled `chat-conversation.tsx`, `chat-prompt-input.tsx`, and `chat-session-list.tsx` to remove the boxed card layout and adopt a cleaner ChatGPT/Claude-style transcript plus bottom composer.
- [x] (2026-03-14 15:15Z) Ran targeted ESLint against the touched chat/dashboard files and `pnpm --filter @advanced-quiz/web check-types`; both passed after a small `useEffectEvent` dependency cleanup.

## Surprises & Discoveries

- Observation: The current dashboard sidebar already persists desktop collapse state through local storage in `apps/web-new/src/layouts/dashboard-layout.tsx`, which means the chat refactor can reuse that state instead of inventing a second shell.
  Evidence: `DashboardLayout` reads and writes `sidebar-collapsed` and passes the resulting `open` state into `SidebarProvider`.

- Observation: The current chat page duplicates navigation responsibility by rendering `ChatSessionList` inside page content even though the app already has a global sidebar.
  Evidence: `apps/web-new/src/pages/dashboard/chat-page.tsx` renders a two-column grid with `ChatSessionList` beside `ChatThread`.

- Observation: The shared sidebar primitive supports desktop off-canvas collapse and mobile sheet behavior already, so chat-specific session navigation should be injected into that shell instead of implemented as a separate responsive component.
  Evidence: `packages/ui/src/components/sidebar.tsx` switches between a fixed desktop sidebar and a mobile `Sheet` based on `useIsMobile()`.

- Observation: The current backend session model already supports empty sessions, so the most natural “new chat” flow is to treat `/dashboard/chat` as a blank canvas and create the session only when the first prompt is submitted.
  Evidence: `apps/web-new/src/pages/dashboard/chat-page.tsx` can create a session on demand with `useCreateChatSession`, then navigate to `/dashboard/chat/:id` and continue with the saved thread.

- Observation: React 19 `useEffectEvent` is available in this repo, but the local ESLint setup expects those returned handlers to stay out of dependency arrays.
  Evidence: The first targeted ESLint run warned in `apps/web-new/src/features/chat/components/chat-thread.tsx` that `sendInitialPrompt` must not appear in the effect dependency list.

## Decision Log

- Decision: Keep the existing dashboard sidebar as the single navigation rail and inject chat sessions into it only on chat routes.
  Rationale: The user asked to move sessions into the Dashboard sidebar, and duplicating sessions inside the page would keep the old information hierarchy.
  Date/Author: 2026-03-14 / Codex

- Decision: Keep chat route detection local to `apps/web-new/src/layouts/dashboard-layout.tsx` instead of introducing a new global layout abstraction.
  Rationale: The dashboard shell already owns pathname-aware chrome, so the smallest coherent change is to extend that file with chat-specific behavior and a wider content mode.
  Date/Author: 2026-03-14 / Codex

- Decision: Preserve the existing AI SDK message flow and focus the refactor on layout, navigation placement, and visual treatment.
  Rationale: The user asked for a UI refactor, not a transport or persistence change, so keeping the message plumbing stable reduces regression risk.
  Date/Author: 2026-03-14 / Codex

- Decision: Make `/dashboard/chat` a blank draft surface and create a persisted session on first submit instead of forcing the user to click a separate “create session” button.
  Rationale: This matches the interaction model of modern assistant UIs more closely and lets the sidebar “New chat” action simply route to the blank composer page.
  Date/Author: 2026-03-14 / Codex

- Decision: Keep the conversation header inside the transcript flow instead of pinning a second sticky chat-specific header under the dashboard navbar.
  Rationale: The dashboard already has a sticky top header, so adding another persistent bar would reduce vertical space and move the design away from the requested ChatGPT/Claude-style simplicity.
  Date/Author: 2026-03-14 / Codex

## Outcomes & Retrospective

The dashboard chat route now behaves like a dedicated assistant workspace instead of a dashboard card. Recent sessions live in the Dashboard sidebar on chat routes, the main pane expands into a full-height conversation surface, and the prompt composer stays anchored to the bottom area while respecting the existing collapsible sidebar shell on desktop and the mobile sheet sidebar on smaller screens.

The most meaningful interaction improvement is that `/dashboard/chat` is now a true blank conversation canvas. The user can open “New chat” from the sidebar, type the first prompt immediately, and the UI creates the backing session automatically before continuing in `/dashboard/chat/:id`. This removes the old extra step of creating a session from a separate in-page rail.

Validation succeeded for the touched frontend scope. The targeted ESLint command passed, and `pnpm --filter @advanced-quiz/web check-types` also passed. Manual browser verification is still the final confirmation step for visual fit and feel across desktop and mobile.

## Context and Orientation

The web app lives in `apps/web-new/src`. The dashboard shell is `apps/web-new/src/layouts/dashboard-layout.tsx`; it wraps authenticated dashboard pages through `apps/web-new/src/pages/dashboard/dashboard-layout-page.tsx` and the route declarations in `apps/web-new/src/pages/app-routes.tsx`. The current chat route is `apps/web-new/src/pages/dashboard/chat-page.tsx`.

The chat feature is organized under `apps/web-new/src/features/chat`. `hooks/use-chat-sessions.ts` loads session summaries and a single session. `components/chat-thread.tsx` drives the AI SDK chat transport for one session. `components/chat-session-list.tsx` renders the current in-page session list. `components/chat-conversation.tsx` and `components/chat-prompt-input.tsx` render the transcript and composer.

In this repository, the “Dashboard sidebar” means the shared sidebar composition imported from `@advanced-quiz/ui/components/sidebar`. It is the persistent left-side shell used across dashboard routes. “Collapsed” means the desktop sidebar moves off canvas and only the main content inset remains visible. On mobile, the same sidebar becomes a sheet overlay, so chat session navigation must work inside that mobile sheet without relying on any desktop-only positioning.

## Plan of Work

First, update `apps/web-new/src/layouts/dashboard-layout.tsx` so it can render two different sidebar bodies: the normal dashboard navigation for all routes and a chat-enhanced version for `/dashboard/chat` and `/dashboard/chat/:id`. The chat-enhanced sidebar must still include the existing dashboard navigation, but it also needs a new session section with a “new chat” action and links for recent sessions. The layout should read the active chat session id from the current pathname and use the existing React Query hooks so the session list stays in the shared cache.

Next, change the dashboard content container behavior for chat routes. The standard dashboard pages should keep the centered max-width wrapper, but chat routes should use a full-height, full-width content area under the sticky header. That gives the conversation room to behave like a true assistant page instead of a boxed card inside a document column.

Then refactor `apps/web-new/src/pages/dashboard/chat-page.tsx` so it no longer renders the session list in page content. It should only be responsible for the active conversation area and empty-session routing behavior. `apps/web-new/src/features/chat/components/chat-thread.tsx` should be updated to remove the card-like frame, simplify the top header, and give the transcript a wide centered reading column plus a bottom composer region with a blurred backdrop. The empty state should look intentional and product-like, with prompt starters and stronger hierarchy rather than a generic bordered block.

Finally, adjust `apps/web-new/src/features/chat/components/chat-conversation.tsx`, `chat-prompt-input.tsx`, and, if necessary, `chat-session-list.tsx` so the transcript spacing, user-message treatment, and input chrome match the new assistant feel. Keep all chat transport behavior intact. After the code changes, run targeted linting or type-checking commands for the touched frontend files and record the result.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `apps/web-new/src/layouts/dashboard-layout.tsx` to add chat-route detection, sidebar session rendering, and chat-specific content width and height behavior.
2. Edit `apps/web-new/src/pages/dashboard/chat-page.tsx` to remove the in-page session rail and hand conversation creation/loading responsibility to the main pane only.
3. Edit `apps/web-new/src/features/chat/components/chat-thread.tsx`, `chat-conversation.tsx`, and `chat-prompt-input.tsx` to produce the new full-page assistant layout.
4. Run:

    pnpm --filter @advanced-quiz/web exec eslint src/layouts/dashboard-layout.tsx src/pages/dashboard/chat-page.tsx src/features/chat/components/chat-thread.tsx src/features/chat/components/chat-conversation.tsx src/features/chat/components/chat-prompt-input.tsx src/features/chat/components/chat-session-list.tsx src/features/chat/hooks/use-chat-sessions.ts

   Observed result:

       The command exited successfully after one intermediate warning about a `useEffectEvent` dependency list was fixed in `chat-thread.tsx`.

5. If lint passes, run:

    pnpm --filter @advanced-quiz/web check-types

   Observed result:

       The command exited successfully.

Expected observable result after implementation:

    - `/dashboard/chat` shows a full-page assistant workspace under the shared dashboard header.
    - The dashboard sidebar contains recent chat sessions and a new-chat action.
    - Collapsing the desktop sidebar or opening the mobile sidebar does not break the prompt composer width or placement.
    - The conversation area is no longer rendered inside a bordered card.

## Validation and Acceptance

Acceptance is behavioral. After signing in and opening `/dashboard/chat`, the main area should resemble a dedicated chat client: message history uses the page body, the composer stays attached to the bottom area, and the left dashboard sidebar holds session navigation. Selecting a session from the sidebar should update the conversation without reintroducing an in-page session list. On desktop, collapsing the sidebar should expand the visible chat area cleanly. On mobile, opening the sidebar sheet should still show the same session list and allow switching sessions.

Command validation should include the targeted frontend lint command from the Concrete Steps section. If `pnpm --filter @advanced-quiz/web check-types` is run, record whether any failures are caused by this refactor or by unrelated existing issues.

Validation status at the end of this work:

    - `pnpm --filter @advanced-quiz/web exec eslint src/layouts/dashboard-layout.tsx src/pages/dashboard/chat-page.tsx src/features/chat/components/chat-thread.tsx src/features/chat/components/chat-conversation.tsx src/features/chat/components/chat-prompt-input.tsx src/features/chat/components/chat-session-list.tsx src/features/chat/hooks/use-chat-sessions.ts`: passed.
    - `pnpm --filter @advanced-quiz/web check-types`: passed.

## Idempotence and Recovery

This refactor is isolated to frontend layout and chat feature files. Re-applying the edits is safe because no migrations or persisted data changes are involved. If the new shell introduces a regression, the safe rollback path is to restore the touched files from version control and rerun the lint command to confirm the previous state is back.

## Artifacts and Notes

Reference files that define the current moving parts:

    - `apps/web-new/src/layouts/dashboard-layout.tsx`
    - `apps/web-new/src/pages/dashboard/chat-page.tsx`
    - `apps/web-new/src/features/chat/components/chat-thread.tsx`
    - `apps/web-new/src/features/chat/components/chat-conversation.tsx`
    - `apps/web-new/src/features/chat/components/chat-prompt-input.tsx`
    - `packages/ui/src/components/sidebar.tsx`

The visual target is not a pixel clone of any external product. The intent is to adopt the same layout principles: the conversation is the page, navigation lives in the sidebar, and the composer anchors the workflow at the bottom.

## Interfaces and Dependencies

This work should continue using:

- `react-router` route state from `useLocation`, `useNavigate`, and `useParams`
- the shared dashboard shell primitives from `@advanced-quiz/ui/components/sidebar`
- existing chat data hooks from `apps/web-new/src/features/chat/hooks/use-chat-sessions.ts`
- the AI SDK React hook in `apps/web-new/src/features/chat/components/chat-thread.tsx`

At the end of the refactor, these exports must still exist and remain usable by the current routes:

- `DashboardLayout` from `apps/web-new/src/layouts/dashboard-layout.tsx`
- `ChatPage` from `apps/web-new/src/pages/dashboard/chat-page.tsx`
- `ChatThread` from `apps/web-new/src/features/chat/components/chat-thread.tsx`

Revision note: Created at implementation start because moving chat sessions into the dashboard shell and turning the chat route into a full-page assistant workspace is a substantial UI refactor covered by the repository ExecPlan requirement.

Revision note: Updated after implementation to record the shipped blank-chat entry flow, the sidebar-session migration, the full-page conversation layout, and the successful frontend validation results.
