# Implement persistent dashboard chat with AI SDK, Prisma, and background session metadata

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, authenticated users can open a dedicated chat workspace at `/dashboard/chat`, create multiple chat sessions, continue prior conversations after a refresh, and see those sessions listed with generated titles and previews. The assistant response streams in real time, the transcript persists in PostgreSQL through Prisma, and a cheaper background model updates session metadata without delaying the visible reply.

## Progress

- [x] (2026-03-14 13:09Z) Confirmed the existing repo structure, dashboard shell, Prisma client setup, current AI controller, and shared contracts patterns.
- [x] (2026-03-14 13:09Z) Reviewed the official AI SDK persistence guidance, AI Elements overview, and Prisma AI SDK guide to lock the persistence model and UI approach.
- [x] (2026-03-14 13:21Z) Added `ChatSession` and `ChatMessage` to `packages/db/prisma/schema.prisma`, generated Prisma outputs, and added a checked-in SQL migration for the new tables.
- [x] (2026-03-14 13:24Z) Added shared chat schemas and response types to `packages/contracts/src/index.ts`.
- [x] (2026-03-14 13:27Z) Replaced the placeholder AI controller with an authenticated Nest chat module that streams responses, persists transcripts, and triggers cheap background metadata generation.
- [x] (2026-03-14 13:25Z) Added dashboard chat routes, session list/data hooks, and AI Elements-style UI in `apps/web-new`.
- [x] (2026-03-14 13:28Z) Ran `pnpm run check-types` and `pnpm run lint`; both passed after fixing the Turbo task ordering issue around Prisma client generation.

## Surprises & Discoveries

- Observation: The repo already uses Prisma, not Drizzle, and the generated client is committed under `packages/db/src/generated/prisma`.
  Evidence: `packages/db/prisma/schema.prisma` and `packages/db/src/generated/prisma/*` already exist.

- Observation: The current AI integration is a single unauthenticated controller using `streamText` directly and is not registered in `AppModule`.
  Evidence: `apps/api-new/src/ai/ai.controller.ts` exists, while `apps/api-new/src/app.module.ts` does not import a dedicated AI module.

- Observation: The web app already has a dashboard shell and route structure that can absorb a chat page without reworking the layout.
  Evidence: `apps/web-new/src/layouts/dashboard-layout.tsx` and `apps/web-new/src/pages/app-routes.tsx`.

- Observation: The live Neon development database is drifted relative to the checked-in Prisma migration history, so `prisma migrate dev` could not safely author the next migration.
  Evidence: `prisma migrate dev --name add_chat_sessions` reported drift and requested a reset of the `public` schema.

- Observation: Turbo was running `@advanced-quiz/db` `build` and `check-types` concurrently, which caused Prisma client generation races under `packages/db/src/generated/prisma`.
  Evidence: `pnpm run check-types` initially failed with `EEXIST: file already exists, mkdir '/home/lenovo/advanced-quiz/packages/db/src/generated/prisma/models'`.

## Decision Log

- Decision: Persist the canonical transcript as ordered message rows but keep the full `UIMessage` JSON payload in each row.
  Rationale: This matches AI SDK persistence guidance while still making per-session ownership and ordering cheap to query in SQL.
  Date/Author: 2026-03-14 / Codex

- Decision: Generate session `title` and `preview` in the background with a cheaper model after each completed turn.
  Rationale: The user explicitly requested a low-cost background model path, and metadata is the right non-blocking target for v1.
  Date/Author: 2026-03-14 / Codex

- Decision: Keep background metadata generation in-process for v1 rather than introducing a separate queue worker.
  Rationale: The repo has no job system yet, and in-process best-effort work is sufficient for session title/preview generation.
  Date/Author: 2026-03-14 / Codex

- Decision: Add the chat-table migration as a checked-in SQL file instead of forcing `prisma migrate dev` to reset the drifted remote development database.
  Rationale: Resetting the shared Neon database would be destructive and unnecessary for this feature; the schema delta is small and deterministic enough to express directly in SQL.
  Date/Author: 2026-03-14 / Codex

- Decision: Make Turbo `check-types` depend on same-package `build` so Prisma-generated clients exist before DB type-checking begins.
  Rationale: This removes a repo-level race that surfaced during feature verification and makes root validation reliable for future schema work.
  Date/Author: 2026-03-14 / Codex

## Outcomes & Retrospective

The chat feature now exists end-to-end. The API exposes authenticated chat session list/create/load/stream routes, the database stores chat sessions and canonical message rows, the dashboard has a dedicated `/dashboard/chat` workspace with a session rail and conversation panel, and session `title` plus `preview` update asynchronously after each turn via a cheaper background model.

Verification passed at the repo level: `pnpm run check-types` and `pnpm run lint` both completed successfully after the Turbo pipeline was adjusted so Prisma generation is not raced by type-checking. Manual runtime verification remains for a real configured AI Gateway key and live model credentials, but the codepaths compile, build, and integrate cleanly.

## Context and Orientation

The API app lives in `apps/api-new/src`. Database access is centralized in `apps/api-new/src/database/database.service.ts`, which wraps the shared Prisma client from `@advanced-quiz/db`. Route controllers use the existing `AuthGuard` and `CurrentUser` patterns found in the collections feature. Shared API request and response schemas live in `packages/contracts/src/index.ts`.

The web app lives in `apps/web-new/src`. The authenticated dashboard shell is implemented in `apps/web-new/src/layouts/dashboard-layout.tsx`, and routes are declared in `apps/web-new/src/pages/app-routes.tsx`. Existing features organize API clients, hooks, components, and types under `src/features/*`.

The database schema source of truth is `packages/db/prisma/schema.prisma`. Prisma generates runtime code into `packages/db/src/generated/prisma`, so any schema changes must be followed by the repo’s Prisma generation flow before type-checking.

## Plan of Work

First, extend the Prisma schema with `ChatSession` and `ChatMessage` models related to `User`. `ChatSession` must store the owner, user-visible metadata, and timestamps. `ChatMessage` must store message ordering, message role, a flattened text field, and a `Json` payload containing the full AI SDK `UIMessage`.

Next, add chat contracts to `packages/contracts/src/index.ts`. These contracts must describe session summaries, session detail payloads, and the request/response bodies used by the web app to create sessions, fetch sessions, and load the session list.

Then replace the current AI placeholder with a real chat module under `apps/api-new/src/ai`. The module must define a controller for session list/create/load/stream endpoints and a service that owns transcript persistence and background metadata generation. The stream endpoint must verify the session belongs to the current user, stream the assistant reply, and on completion transactionally rewrite that session’s `ChatMessage` rows from the finalized canonical transcript. After the transcript save succeeds, the service must asynchronously invoke a cheaper model to produce `title` and `preview`, validate the output, and update only the owning `ChatSession`.

Finally, add a new web feature under `apps/web-new/src/features/chat`, wire routes for `/dashboard/chat` and `/dashboard/chat/:id`, add a sidebar link, and build a two-pane chat workspace. The left pane must list sessions with `title`, `preview`, and relative update time. The right pane must render a conversation view and prompt input using AI Elements-style components stored locally in the web app and adapted to the existing dashboard design system.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `packages/db/prisma/schema.prisma` to add `ChatSession` and `ChatMessage`.
2. Generate Prisma outputs so `packages/db/src/generated/prisma` matches the schema.
3. Edit `packages/contracts/src/index.ts` to export chat schemas and types.
4. Add the Nest chat module under `apps/api-new/src/ai` and register it in `apps/api-new/src/app.module.ts`.
5. Add the web chat feature, routes, and dashboard navigation in `apps/web-new/src`.
6. Install any missing runtime dependencies for AI SDK React usage in the web app.
7. Run:

    pnpm run check-types

8. Run:

    pnpm run lint

9. If validation is clean enough, manually verify the feature by running:

    pnpm run dev

Expected observable result after implementation:

    - `/dashboard/chat` shows a chat workspace with a session list and conversation panel.
    - Sending a message streams the assistant reply.
    - Refreshing preserves the transcript.
    - The session list updates with generated `title` and `preview` shortly after each completed turn.

## Validation and Acceptance

Acceptance is behavioral. After signing in, a user should be able to create a new chat session, send a message, see the response stream, refresh the page, and continue the same session with its transcript intact. The left rail should list multiple sessions owned by the user only. Titles and previews should appear immediately with fallback text and then update after background metadata generation completes. Existing collections and learning routes must still work.

Command validation must include `pnpm run check-types` and `pnpm run lint`. If dependency installation or Prisma generation is required, the resulting lockfile and generated Prisma outputs must be consistent with the edited schema and package manifests.

## Idempotence and Recovery

The application code changes are additive and can be re-applied safely. Prisma schema changes are safe to regenerate multiple times. If the feature regresses, the rollback path is to revert the chat-specific schema/models/contracts/routes and regenerate the Prisma client to restore consistency.

## Artifacts and Notes

Important reference files for this work:

    - `packages/db/prisma/schema.prisma`
    - `packages/contracts/src/index.ts`
    - `apps/api-new/src/database/database.service.ts`
    - `apps/api-new/src/auth/auth.guard.ts`
    - `apps/api-new/src/auth/current-user.decorator.ts`
    - `apps/web-new/src/layouts/dashboard-layout.tsx`
    - `apps/web-new/src/pages/app-routes.tsx`

## Interfaces and Dependencies

At the end of the work, these interfaces must exist:

- Prisma models `ChatSession` and `ChatMessage`
- shared contracts for chat session summaries and detail responses
- authenticated API routes under `/api/v1/chat/*`
- dashboard routes `/dashboard/chat` and `/dashboard/chat/:id`

Dependencies:

- `ai` remains the backend AI SDK runtime
- `@ai-sdk/react` is added to the web app for client chat state and transport
- AI Elements-style components are added as local source files in the web app rather than a shared package dependency

Revision note: Created at implementation start because this is a substantial cross-workspace feature and the repository requires an ExecPlan for larger changes.

Revision note: Updated after implementation to record the checked-in migration artifact, the Turbo/Prisma generation race fix, and the final validation results.
