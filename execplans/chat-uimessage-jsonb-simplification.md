# Simplify chat persistence by storing canonical UI messages as JSONB

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, each chat session stores its canonical transcript directly on the `chat_session` row as a JSONB `UIMessage[]` payload instead of spreading the same information across `chat_message` rows and derived text fields. The browser will only send the latest message on each `sendMessage` call, the API will load the session’s stored transcript, append the new message, stream the assistant response, and persist the finished `UIMessage[]` back to PostgreSQL. A user can verify the behavior by opening `/dashboard/chat/:id`, sending a follow-up message, refreshing, and seeing the full transcript restored even though the network request only carried the newest message.

## Progress

- [x] (2026-03-15 03:05Z) Re-read `PLANS.md`, the current chat controller/service, Prisma schema, web transport, and the prior chat persistence ExecPlans to confirm the existing row-based design.
- [x] (2026-03-15 03:16Z) Reviewed the AI SDK persistence guidance for storing `UIMessage[]`, loading prior messages on the server, and using `prepareSendMessagesRequest` to send only the newest client message.
- [x] (2026-03-15 03:24Z) Queried npm and confirmed the current latest package versions relevant to this refactor: `ai@6.0.116` and `@ai-sdk/react@3.0.118`.
- [x] (2026-03-15 02:51Z) Replaced the Prisma `ChatMessage` relation with a JSON `messages` field on `ChatSession`, regenerated Prisma outputs, and pushed the final schema.
- [x] (2026-03-15 02:51Z) Refactored the API chat controller/service so streaming reconstructs the full prompt from persisted session messages plus the newest client message and then saves the finished canonical transcript back to the session row.
- [x] (2026-03-15 02:51Z) Upgraded the web chat package to `@ai-sdk/react@^3.0.118` and `ai@^6.0.116`, then refactored saved-session and first-turn transports to send only the newest message.
- [x] (2026-03-15 02:51Z) Ran `pnpm install`, a SQL backfill for legacy transcripts, `pnpm run db:push`, `pnpm run check-types`, and `pnpm run lint`.
- [x] (2026-03-15 02:52Z) Started `pnpm run dev` and confirmed both Vite (`http://localhost:5173/`) and the Nest API (`http://localhost:3001`) booted cleanly before stopping the process.

## Surprises & Discoveries

- Observation: The repository already contains AI SDK persistence logic, but it persists each message twice: once as a full `payload` JSON blob and again as flattened `role`, `position`, and `textContent` columns.
  Evidence: `packages/db/prisma/schema.prisma` defines `ChatMessage.payload`, `ChatMessage.role`, `ChatMessage.position`, and `ChatMessage.textContent`, while `apps/api-new/src/ai/ai.service.ts` rewrites all rows on each completed turn.

- Observation: The web package manifest is still pinned to the older AI SDK major line even though the API package is already on the current `ai` 6 line.
  Evidence: `apps/web-new/package.json` currently lists `@ai-sdk/react` `^2.0.116` and `ai` `5.0.154`, while `apps/api-new/package.json` already lists `ai` `^6.0.116`.

- Observation: Dropping the legacy `chat_message` table would have caused data loss without an explicit backfill because the table still contained persisted transcripts.
  Evidence: `prisma db push --accept-data-loss` warned that `chat_message` was not empty with 10 rows before the final schema sync.

## Decision Log

- Decision: Store the entire canonical transcript on `ChatSession.messages` as JSON and remove the `ChatMessage` table from the active schema.
  Rationale: The user explicitly wants `UIMessage` persistence in JSONB and removal of redundant fields; the separate message table now adds write amplification without providing behavior this feature needs.
  Date/Author: 2026-03-15 / Codex

- Decision: Keep `title` and `preview` on `ChatSession` even while removing `ChatMessage`.
  Rationale: Those fields remain user-facing session metadata for the sidebar and are not redundant with the persisted transcript payload.
  Date/Author: 2026-03-15 / Codex

- Decision: Upgrade the web app to `ai@6.0.116` and `@ai-sdk/react@3.0.118` as part of this refactor.
  Rationale: The user explicitly requested consideration of the latest AI SDK version, and aligning the web transport with the current AI SDK documentation avoids implementing a new persistence pattern on an outdated client package line.
  Date/Author: 2026-03-15 / Codex

- Decision: Backfill `chat_session.messages` with direct SQL before the final Prisma push that removes `chat_message`.
  Rationale: This preserves existing transcripts while still allowing the final schema to remove the redundant legacy table.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

The chat persistence path is now materially simpler. `ChatSession` stores the canonical transcript directly as JSON, the API loads that transcript and appends the newest client message before streaming, and the web client only sends the latest message for both first-turn and saved-session requests. The web package is now aligned with the current AI SDK major line used by the API.

The riskiest part of the change was preserving existing data while removing `chat_message`. That is now handled by a one-time SQL backfill executed before the final Prisma push. Validation passed for the repo commands the repository expects: `pnpm run db:push`, `pnpm run check-types`, and `pnpm run lint`, and `pnpm run dev` booted both the web and API apps cleanly before being stopped manually.

## Context and Orientation

The API chat feature lives in `apps/api-new/src/ai`. `ai.controller.ts` exposes authenticated streaming and session routes. `ai.service.ts` owns database reads and writes, fallback metadata generation, and the background title update. The database client is provided by `apps/api-new/src/database/database.service.ts`, which wraps the Prisma client from `@advanced-quiz/db`.

The database schema source of truth is `packages/db/prisma/schema.prisma`. Right now it uses two models for chat persistence: `ChatSession` stores user ownership plus metadata, while `ChatMessage` stores each transcript item separately. Prisma code is generated into `packages/db/src/generated/prisma`, so the generated files must be refreshed after schema edits.

The web chat UI lives in `apps/web-new/src/features/chat`. `components/chat-thread.tsx` creates the AI SDK chat instance and configures `DefaultChatTransport`. `api/chat-api.ts` defines the REST endpoints and stream URLs. The current transport sends the full message array on each request, which is what this plan will narrow down to just the newest client message.

In this repository, a `UIMessage` is the AI SDK’s frontend-oriented chat message shape. It is richer than the model-prompt message format because it keeps message ids and UI parts for rendering. The AI SDK persistence guidance recommends storing these `UIMessage` objects directly and converting them to model messages only on the server right before calling the language model.

## Plan of Work

First, edit `packages/db/prisma/schema.prisma` so `ChatSession` owns a `messages Json` column with an empty-array default and delete the `ChatMessage` model plus the relation fields that only exist for it. Then regenerate Prisma outputs so the checked-in client matches the new schema. Because the user explicitly requested the database update, finish this stage by running `pnpm run db:push` from the repo root.

Next, update `packages/contracts/src/index.ts` so the chat session detail schemas still expose `messages: UIMessage[]`, but the streaming request body represents the new latest-message-only contract. The API no longer needs a body shaped like `{ messages: UIMessage[] }` for follow-up sends. Instead, it should accept a single `message` plus the session identifier already present in the route or request body.

Then refactor `apps/api-new/src/ai/ai.controller.ts` and `apps/api-new/src/ai/ai.service.ts`. The controller should load the persisted session transcript for existing sessions, append the newest client message, convert the combined `UIMessage[]` to model messages, and pass the combined array as `originalMessages` when streaming back to the client. On `onFinish`, the service should overwrite `ChatSession.messages` with the finished canonical transcript and continue to update fallback `title` and `preview` plus background title generation. The draft-first route should use the same persistence format so the first saved session also lands as a JSON transcript.

Finally, update `apps/web-new/package.json` to the current AI SDK versions, refresh the lockfile, and refactor `apps/web-new/src/features/chat/components/chat-thread.tsx` to use `prepareSendMessagesRequest`. For persisted sessions, the transport should send only the newest message along with the session id. For a brand-new draft thread, the first-turn stream can continue sending the full local message array because there is no stored server transcript yet. After the code compiles, run the repo validation commands and document the exact outcome here.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `packages/db/prisma/schema.prisma` to remove `ChatMessage` and add a JSON `messages` field to `ChatSession`.
2. Edit `packages/contracts/src/index.ts` to reflect the new follow-up stream request body shape.
3. Edit `apps/api-new/src/ai/ai.controller.ts` and `apps/api-new/src/ai/ai.service.ts` to reconstruct full prompts from persisted chat history and save finished transcripts back to `ChatSession.messages`.
4. Edit `apps/web-new/package.json`, refresh dependencies, and refactor the transport in `apps/web-new/src/features/chat/components/chat-thread.tsx` plus any small API helpers needed.
5. Run:

    pnpm install

6. Run a one-time backfill before the final schema push so existing transcripts survive the legacy table removal:

    pnpm --filter @advanced-quiz/db exec prisma db execute --config ./prisma.config.ts --stdin <<'SQL'
    ALTER TABLE "chat_session"
    ADD COLUMN IF NOT EXISTS "messages" JSONB NOT NULL DEFAULT '[]'::jsonb;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'chat_message'
      ) THEN
        UPDATE "chat_session" AS cs
        SET "messages" = source.messages
        FROM (
          SELECT "session_id", jsonb_agg("payload" ORDER BY "position") AS messages
          FROM "chat_message"
          GROUP BY "session_id"
        ) AS source
        WHERE cs."id" = source."session_id"
          AND cs."messages" = '[]'::jsonb;
      END IF;
    END $$;
    SQL

7. Run:

    pnpm --filter @advanced-quiz/db exec prisma db push --config ./prisma.config.ts --accept-data-loss

8. Run:

    pnpm run db:push

9. Run:

    pnpm run check-types

10. Run:

    pnpm run lint

If validation passes, the observable result should be:

    - Existing chat sessions still load with their full transcript.
    - A follow-up send from `/dashboard/chat/:id` hits the server with only the newest client message in the request body.
    - The server combines that newest message with previously persisted session messages, streams the assistant reply, and persists the completed transcript back into `chat_session.messages`.
    - Refreshing the page still restores the full conversation.

## Validation and Acceptance

Acceptance is behavioral. For a saved chat session, opening the browser network tab and sending a follow-up message should show a request body that contains only the newest message instead of the whole conversation. The server should still respond in context, proving it reloaded prior messages from storage. After refresh, the entire transcript should render from the persisted session record. Creating a brand-new chat must continue to work, and the session list should still show title and preview metadata.

Command validation must include `pnpm install`, the legacy transcript backfill command, `pnpm run db:push`, `pnpm run check-types`, and `pnpm run lint`. Record any failures with whether they are caused by this refactor or by unrelated pre-existing worktree changes.

## Idempotence and Recovery

The schema and code changes are safe to rerun. `pnpm install` can be repeated to converge the lockfile and workspace dependencies. `pnpm run db:push` is idempotent for an unchanged schema. If the JSON transcript refactor needs to be rolled back, restore the previous Prisma schema and chat files, rerun Prisma generation, and push the reverted schema so the database and generated client match again.

## Artifacts and Notes

Important working files for this plan:

    - `packages/db/prisma/schema.prisma`
    - `packages/contracts/src/index.ts`
    - `apps/api-new/src/ai/ai.controller.ts`
    - `apps/api-new/src/ai/ai.service.ts`
    - `apps/web-new/src/features/chat/api/chat-api.ts`
    - `apps/web-new/src/features/chat/components/chat-thread.tsx`
    - `apps/web-new/package.json`

## Interfaces and Dependencies

At the end of this work, these interfaces must exist:

- Prisma model `ChatSession` with a `messages` JSON field containing persisted `UIMessage[]`.
- Shared contract type for a saved chat session whose `messages` field is still an array of `UIMessage`.
- API stream bodies for saved sessions that accept only the newest client message.
- Web chat transport configuration that uses `prepareSendMessagesRequest` for saved sessions.

Dependencies to use:

- `ai@6.0.116`
- `@ai-sdk/react@3.0.118`
- existing NestJS controller/service structure under `apps/api-new/src/ai`
- existing Prisma client generation under `packages/db`

Revision note: Created at implementation start because converting the chat persistence model, request contract, and AI SDK client version together is a substantial cross-workspace refactor that falls under the repository ExecPlan requirement.

Revision note: Updated after implementation to record the data-preserving SQL backfill, the final Prisma push that removed `chat_message`, the web AI SDK upgrade, and the successful validation commands.
