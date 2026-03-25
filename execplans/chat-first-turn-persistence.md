# Persist new chats only after the first assistant turn completes

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, opening `/dashboard/chat` should remain a true draft surface until the assistant successfully completes the first reply. The app should stream that first turn locally without creating a database row up front, then persist the completed two-message transcript only after the assistant finishes. A user can verify the result by opening a blank chat, sending a first prompt, watching the reply stream, and confirming that the session appears in the sidebar and route only after the reply completes. If the first turn fails, no empty session should be left behind.

## Progress

- [x] (2026-03-14 16:29Z) Read `PLANS.md`, the current chat frontend files, and the API controller/service flow to confirm where pre-creation still happens.
- [x] (2026-03-14 16:29Z) Confirmed the current blank-chat page creates a session before streaming because `apps/web-new/src/pages/dashboard/chat-page.tsx` calls `useCreateChatSession` and navigates before `useChat` sends the first message.
- [ ] Add a draft stream endpoint plus a create-and-persist session path that reuses the existing persistence and background title generation logic.
- [ ] Refactor the blank chat UI to run the first turn as a local draft and persist/navigate in `onFinish`.
- [ ] Run targeted frontend and API type/lint validation and record the observed results.

## Surprises & Discoveries

- Observation: The existing backend already centralizes message persistence and background title generation in `AIService.persistCompletedTurn`, so the safest change is to reuse that logic rather than duplicating metadata updates in a new path.
  Evidence: `apps/api-new/src/ai/ai.service.ts` updates `title`, `preview`, and queues `generateSessionTitle` when the saved conversation has exactly one user turn and one assistant turn.

## Decision Log

- Decision: Persist the first completed turn through the existing `POST /api/v1/chat/sessions` route by allowing it to accept optional messages.
  Rationale: This keeps session creation in one API surface and avoids inventing a second persistence endpoint for the same resource.
  Date/Author: 2026-03-14 / Codex

- Decision: Add a separate non-persistent draft stream route for the first turn instead of trying to stream through a fake session id.
  Rationale: The user explicitly wants failed first turns to avoid leaving empty saved chats behind, which requires a streaming path that does not depend on a pre-created row.
  Date/Author: 2026-03-14 / Codex

## Outcomes & Retrospective

Pending implementation.

## Context and Orientation

The API chat feature lives in `apps/api-new/src/ai`. `ai.controller.ts` exposes the authenticated HTTP endpoints and `ai.service.ts` owns database persistence plus background title generation. The web chat feature lives in `apps/web-new/src/features/chat`. `components/chat-thread.tsx` renders both the blank draft surface and a saved session thread, while `apps/web-new/src/pages/dashboard/chat-page.tsx` decides whether the route is `/dashboard/chat` or `/dashboard/chat/:id`.

In this repository, a “draft chat” means the first user message and assistant response exist only in the browser until they are saved. A “persisted chat session” means the transcript is stored in PostgreSQL and appears in the sidebar session list.

## Plan of Work

First, update the contracts in `packages/contracts/src/index.ts` so `POST /api/v1/chat/sessions` can accept an optional `messages` array, and add a request schema for a new draft stream route that accepts chat messages without a session id. Then update `apps/api-new/src/ai/ai.controller.ts` to expose `POST /api/v1/chat/stream` for non-persistent first-turn streaming while keeping `POST /api/v1/chat/sessions/:id/stream` for existing sessions. Extend `apps/api-new/src/ai/ai.service.ts` with a helper that creates a session, persists provided messages, and reuses the existing fallback metadata plus background title generation path.

Next, refactor `apps/web-new/src/features/chat/api/chat-api.ts` and `hooks/use-chat-sessions.ts` so blank chats can call the draft stream endpoint and persist completed messages through the existing create-session mutation. Then refactor `apps/web-new/src/features/chat/components/chat-thread.tsx` so the no-session state owns a local `useChat` draft, shows the same conversation UI while the first turn streams, and calls the create-session mutation in `onFinish`. Only after that save succeeds should the UI invalidate the session list cache and navigate to `/dashboard/chat/:id`.

Finally, simplify `apps/web-new/src/pages/dashboard/chat-page.tsx` so it no longer creates a session preemptively. Keep the existing saved-session path intact. After the code changes, run targeted validation commands for the touched API and web files and record the result here.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `packages/contracts/src/index.ts`, `apps/api-new/src/ai/ai.controller.ts`, and `apps/api-new/src/ai/ai.service.ts` to support draft streaming and create-and-persist session creation.
2. Edit `apps/web-new/src/features/chat/api/chat-api.ts`, `apps/web-new/src/features/chat/hooks/use-chat-sessions.ts`, `apps/web-new/src/features/chat/components/chat-thread.tsx`, and `apps/web-new/src/pages/dashboard/chat-page.tsx` to move first-turn persistence into the blank-thread `onFinish` flow.
3. Run targeted validation commands and record whether failures are caused by this refactor or by unrelated existing worktree changes.

## Validation and Acceptance

Acceptance is behavioral. After opening `/dashboard/chat`, the user should be able to submit the first prompt and see the assistant stream a reply before the route changes to a saved session id. Once the reply finishes, the app should persist the transcript, navigate into `/dashboard/chat/:id`, and show the new session in the sidebar with its fallback title, followed by background title refinement. If the first turn fails before completion, refreshing the page should not reveal an empty saved session.

Command validation should include targeted type-checking or linting for the touched API and web files.

## Idempotence and Recovery

This refactor should be safe to reapply because it only changes contracts and application code; no database migration is required. If the draft-first path regresses, the recovery path is to restore the touched files and rerun the validation commands listed in this document.

## Artifacts and Notes

Key files for this work:

    - `apps/api-new/src/ai/ai.controller.ts`
    - `apps/api-new/src/ai/ai.service.ts`
    - `apps/web-new/src/features/chat/components/chat-thread.tsx`
    - `apps/web-new/src/pages/dashboard/chat-page.tsx`
    - `packages/contracts/src/index.ts`

## Interfaces and Dependencies

This change should continue using:

- NestJS controllers and services in `apps/api-new/src/ai`
- the AI SDK `streamText` and UI message stream helpers
- the React AI SDK `useChat` hook in `apps/web-new/src/features/chat/components/chat-thread.tsx`
- React Query cache keys `["chat", "sessions"]` and `["chat", "sessions", sessionId]`

At the end of the work, these behaviors must exist:

- `POST /api/v1/chat/stream` streams a first-turn assistant reply without persisting a session.
- `POST /api/v1/chat/sessions` can create an empty session or create-and-persist one when `messages` are provided.
- `/dashboard/chat` keeps the first turn local until `onFinish` persists it and redirects into a saved session.

Revision note: Created at implementation start because changing the first-turn persistence model is a cross-cutting AI flow refactor that falls under the repository ExecPlan requirement.
