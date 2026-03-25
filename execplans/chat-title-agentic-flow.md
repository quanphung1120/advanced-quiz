# Refactor Chat Title Generation To AI SDK Agentic Flow

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md) from the repository root and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, chat session titles should no longer get stuck as `"New chat"` or as the first user message. The backend will use an AI SDK multi-step tool flow: first inspect whether a real title already exists, then only ask the model to generate a new title when the current title is still a placeholder or fallback. A user can verify this by sending a first chat message, then a follow-up; the session title should become a short topic label instead of mirroring the first prompt.

## Progress

- [x] (2026-03-15 04:01Z) Inspected the current title generation flow in `apps/api-new/src/ai/ai.service.ts` and confirmed fallback titles were being treated as final titles on later turns.
- [x] (2026-03-15 04:01Z) Verified the current repo uses `ai@^6.0.116` and checked the official AI SDK docs for multi-step tool calls with `generateText`, `tool`, `stopWhen`, and `prepareStep`.
- [x] (2026-03-15 04:01Z) Refactored session title generation to use an AI SDK multi-step tool loop that checks title state first and only generates when missing.
- [x] (2026-03-15 04:09Z) Corrected an inverted `hasMeaningfulTitle` check discovered during implementation review.
- [x] (2026-03-15 04:09Z) Ran `pnpm run check-types` and `pnpm run lint`; both passed after the agentic-flow refactor.
- [x] (2026-03-15 10:48+07) Fixed the runtime warning where title generation stopped after the forced tool call and never reached the structured-output step.

## Surprises & Discoveries

- Observation: The previous bug was not only timing-related. Once the fallback title equaled the first user message, later turns stopped re-generating because the code treated any non-`"New chat"` title as final.
  Evidence: `persistCompletedTurn()` previously only generated when `currentTitle === DEFAULT_SESSION_TITLE`.

- Observation: The official AI SDK docs support this design directly through `generateText` tool calling, `stopWhen`, and `prepareStep`, so a separate agent framework is unnecessary for this repo.
  Evidence: `https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling` and `https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text`

- Observation: The first implementation review caught a logic inversion where `"New chat"` would have been incorrectly treated as a meaningful existing title.
  Evidence: `hasMeaningfulTitle()` initially returned `true` for `DEFAULT_SESSION_TITLE` and had to be corrected before final validation.

- Observation: AI SDK structured outputs add an extra generation step on top of tool execution, so `stepCountIs(2)` is insufficient for a forced tool call followed by object output.
  Evidence: The local AI SDK troubleshooting doc `node_modules/.pnpm/ai@6.0.116_zod@3.25.76/node_modules/ai/docs/09-troubleshooting/14-tool-calling-with-structured-outputs.mdx` states that structured output generation counts as an additional step.

## Decision Log

- Decision: Use `generateText` multi-step tool calling instead of introducing a separate `ToolLoopAgent` class.
  Rationale: The repo already uses `generateText`; multi-step tools plus `prepareStep` are sufficient to implement the requested “check first, generate second” flow with less surface area.
  Date/Author: 2026-03-15 / Codex

- Decision: Treat the normalized first-message fallback title as “missing” even when it is stored in the database.
  Rationale: A title that just echoes the first user prompt is the current failure mode and should not block regeneration.
  Date/Author: 2026-03-15 / Codex

- Decision: Set `stopWhen` to `stepCountIs(3)` for the title generator.
  Rationale: This flow needs one step for the forced inspection tool call, one follow-up model step after the tool result, and one additional step for `Output.object(...)` to produce schema-validated output.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

The backend now uses a real AI SDK two-step title-selection flow. Step 1 is a forced inspection tool call that reports whether the current stored title is meaningful or is still a placeholder/fallback. Step 2 either preserves that title unchanged or generates a concise topic label. Validation passed, and the flow now matches the user’s requested “check first, generate only if missing” design.

## Context and Orientation

Chat title generation lives in `apps/api-new/src/ai/ai.service.ts`. The HTTP endpoints in `apps/api-new/src/ai/ai.controller.ts` call `persistCompletedTurn()` after each streamed assistant response finishes. That method is responsible for storing messages, updating preview text, and deciding what title to save.

In this repository, a “fallback title” means a title derived mechanically from the first user message. A “real title” means a short topic label that should survive later turns. The requested “Agentic Flow of AI SDK” maps cleanly to AI SDK Core multi-step tool calling: a first step executes a tool that inspects current title state, then a second model step returns the final title only if generation is needed.

## Plan of Work

Update `apps/api-new/src/ai/ai.service.ts` so `persistCompletedTurn()` delegates title selection to a new helper that uses AI SDK multi-step generation. Add a small inspection tool that reports whether the current title is already real or is still a placeholder/fallback. Force that tool to run in the first step using `prepareStep`, then let the model produce a structured title in the second step with no active tools.

Keep the deterministic fallback metadata builder in place as the final safety net. If the model fails, the service should still fall back to the first-message-derived title rather than leaving the session blank.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `apps/api-new/src/ai/ai.service.ts` to import the AI SDK tool-loop helpers needed for multi-step title generation.
2. Replace the current direct title-generation helper with a multi-step `generateSessionTitle()` implementation that:
   a. Computes fallback title metadata.
   b. Runs an inspection tool first.
   c. Lets the model return a structured title only when the inspection reports no real title yet.
3. Keep `persistCompletedTurn()` responsible for writing the chosen title and preview in one database update.
4. Run `pnpm run check-types`.
5. Run `pnpm run lint`.

## Validation and Acceptance

Acceptance is behavioral and command-based. `pnpm run check-types` and `pnpm run lint` now pass from the repository root. After starting the API and web app, opening a new chat, sending a first message, and then sending one more follow-up, the session title should become a concise topic label instead of staying equal to the first message text.

## Idempotence and Recovery

The change is safe to retry because it only modifies server-side title selection logic. If the agentic flow fails at runtime, the code must still return the deterministic fallback title so existing chat persistence remains functional.

## Artifacts and Notes

Primary-source references used for this refactor:

    https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
    https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text

Validation evidence:

    pnpm run check-types
    Tasks:    7 successful, 7 total

    pnpm run lint
    Tasks:    5 successful, 5 total

## Interfaces and Dependencies

`apps/api-new/src/ai/ai.service.ts` should continue to expose `persistCompletedTurn(sessionId, currentTitle, messages)` with the same signature. Internally it should use AI SDK Core helpers from the `ai` package to execute a two-step tool loop for title selection, and it should continue returning a plain string or `null` title candidate to the persistence layer.

Revision note: Updated this plan after implementation to record the final AI SDK tool-loop design, the corrected title-state predicate, the structured-output step-count fix, and the passing validation commands.
