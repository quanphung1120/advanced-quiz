# Migrate the NestJS API from Fastify to Express

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md).

## Purpose / Big Picture

After this change, the backend API should boot on NestJS's Express adapter instead of the Fastify adapter while keeping the same routes, cookies, auth behavior, and chat streaming contract used by the web app. A developer should be able to start the API, hit `/health`, log in with cookie-based auth, and use the dashboard chat stream without any Fastify-specific runtime code remaining in the API entrypoints and controllers.

## Progress

- [x] 2026-03-14 14:27Z Read `PLANS.md`, inspected the current Fastify-specific bootstrap and controller code, and confirmed the migration surface is limited to bootstrap, auth request/response handling, JWT cookie extraction, and the AI streaming endpoint.
- [x] 2026-03-14 14:29Z Replaced Fastify runtime dependencies with Express dependencies in `apps/api-new/package.json` and refreshed `pnpm-lock.yaml` with `pnpm install --filter @advanced-quiz/api... --no-frozen-lockfile`.
- [x] 2026-03-14 14:30Z Refactored `apps/api-new/src/main.ts` to use the default Nest Express runtime and `cookie-parser` while preserving CORS and Swagger setup.
- [x] 2026-03-14 14:30Z Refactored auth and request typing away from `fastify` types in `apps/api-new/src/auth/auth.controller.ts`, `apps/api-new/src/auth/jwt.strategy.ts`, and `apps/api-new/src/common/authenticated-request.ts`.
- [x] 2026-03-14 14:31Z Refactored `apps/api-new/src/ai/ai.controller.ts` to stream over Express `ServerResponse`, added abort wiring, and preserved persistence only for non-aborted completions.
- [x] 2026-03-14 14:32Z Validated with `pnpm --filter @advanced-quiz/api check-types` and `pnpm --filter @advanced-quiz/api build`, then ran `pnpm --filter @advanced-quiz/api start` and confirmed Nest bootstraps successfully before the sandbox blocks binding to `0.0.0.0:3001`.

## Surprises & Discoveries

- Observation: The backend's adapter lock-in is smaller than it first appears; only four source files and the bootstrap path import `fastify` or `@nestjs/platform-fastify`.
  Evidence: `rg -n "Fastify|fastify|platform-fastify|setCookie|clearCookie|reply\\.hijack|reply\\.raw" apps/api-new/src -S`

- Observation: The chat endpoint already uses AI SDK's Node response streaming helper shape, so Express can keep the same basic streaming approach by passing the Express response object directly.
  Evidence: `ai` v6 exports `pipeUIMessageStreamToResponse`, whose source accepts a `ServerResponse`, and `express.Response` extends Node's `ServerResponse`.

- Observation: `pnpm install` required both non-interactive mode and network access outside the sandbox to refresh the lockfile after swapping adapter packages.
  Evidence: `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` was resolved by `CI=true`, and the follow-up install hit `EAI_AGAIN` registry errors until rerun with escalated permissions.

- Observation: The migrated API now reaches full Nest route registration and only fails when the sandbox refuses the port bind.
  Evidence: `pnpm --filter @advanced-quiz/api start` logged all controller routes and `Nest application successfully started` before exiting with `listen EPERM: operation not permitted 0.0.0.0:3001`.

## Decision Log

- Decision: Keep all existing API routes, payloads, and cookie names unchanged while swapping adapters.
  Rationale: The web app already consumes these endpoints, especially cookie-based auth and `/api/v1/chat/sessions/:id/stream`, so the migration should be operational rather than product-facing.
  Date/Author: 2026-03-14 / Codex

- Decision: Use `cookie-parser` in bootstrap and Express `Request`/`Response` types only at controller boundaries that require direct cookie or stream access.
  Rationale: This removes Fastify coupling while keeping the broader NestJS controller/service design intact.
  Date/Author: 2026-03-14 / Codex

- Decision: Preserve chat streaming in the same migration and add explicit abort wiring for the request stream.
  Rationale: The user requested alignment with the official AI SDK + NestJS Express approach, and the dashboard chat feature depends on streaming behavior rather than a buffered response.
  Date/Author: 2026-03-14 / Codex

## Outcomes & Retrospective

The API now runs on Express instead of Fastify. Fastify runtime packages were removed from the API workspace, `cookie-parser` replaced Fastify cookie registration, auth endpoints now use Express response helpers for cookies, JWT extraction reads from Express request cookies, and the chat stream uses AI SDK's Node response piping directly on the Express response object with abort-aware cleanup. Typecheck and build both passed after the migration. Runtime validation in this sandbox could confirm successful Nest bootstrap and route registration but could not complete the listen step because binding to `0.0.0.0:3001` is blocked here.

## Context and Orientation

The NestJS backend lives in `apps/api-new/src`. `apps/api-new/src/main.ts` is the process entrypoint and currently creates a `NestFastifyApplication` with `FastifyAdapter`, then registers `@fastify/cookie`. `apps/api-new/src/auth/auth.controller.ts` manages auth cookies and currently depends on `FastifyReply` and `FastifyRequest`. `apps/api-new/src/auth/jwt.strategy.ts` reads the `access_token` cookie during Passport JWT extraction. `apps/api-new/src/common/authenticated-request.ts` defines the request type used by the `CurrentUser` decorator. `apps/api-new/src/ai/ai.controller.ts` exposes the chat session endpoints and currently streams responses by hijacking the Fastify reply and piping AI SDK output to `reply.raw`.

In NestJS, an adapter is the HTTP server implementation behind the same controller and dependency-injection model. Fastify and Express expose different request and response APIs, especially around cookies and low-level streaming. This migration is only about the adapter and those low-level HTTP primitives. It does not change database access, route structure, DTOs, auth token generation, or the web app contract.

## Plan of Work

First, update `apps/api-new/package.json` to replace the Fastify-specific dependencies with Express dependencies. Remove `@nestjs/platform-fastify`, `fastify`, and `@fastify/cookie`. Add `@nestjs/platform-express`, `express`, `cookie-parser`, `@types/express`, and `@types/cookie-parser`. Refresh the lockfile after editing the manifest so the workspace can compile against the new runtime.

Next, update `apps/api-new/src/main.ts` to create a standard Nest application backed by Express. Import `cookie-parser`, call `app.use(cookieParser(authSecret))`, keep `app.enableCors(buildCorsOptions(configService))`, keep the same Swagger setup, and continue listening on the configured port and host. Adjust the Swagger description text so it no longer advertises Fastify.

Then refactor auth-side request and response handling. In `apps/api-new/src/auth/auth.controller.ts`, replace `FastifyReply` and `FastifyRequest` with Express `Response` and `Request`. Use `@Res({ passthrough: true })` for cookie-setting endpoints so Nest can still serialize the returned JSON body while Express manages cookies. Convert `reply.setCookie(...)` to `response.cookie(...)`, `reply.clearCookie(...)` to `response.clearCookie(...)`, and `reply.code(...).send(...)` to `response.status(...).json(...)`. Keep the same cookie flags and max-age values. In `apps/api-new/src/auth/jwt.strategy.ts`, read the access token from the Express request cookie bag before falling back to `Authorization: Bearer`. In `apps/api-new/src/common/authenticated-request.ts`, rebase the authenticated request type onto Express `Request`.

Finally, refactor `apps/api-new/src/ai/ai.controller.ts` so it uses Express response streaming without buffering. Replace `FastifyReply` with Express `Request` and `Response`. Create an `AbortController`, abort it when the incoming request closes before the response finishes, and pass `abortSignal` into `streamText`. Pipe the result into the Express response with `result.pipeUIMessageStreamToResponse(response, ...)`, preserve the current CORS headers for the stream response, pass `originalMessages`, keep the existing message ID generator, and use `consumeSseStream: consumeStream` so `onFinish` still fires on aborts. Persist the completed turn only when `isAborted` is false.

## Concrete Steps

From the repository root `/home/lenovo/advanced-quiz`, update the API dependencies:

    pnpm install --filter @advanced-quiz/api...

Then validate the backend:

    pnpm --filter @advanced-quiz/api check-types
    pnpm --filter @advanced-quiz/api build

If a local runtime smoke test is possible, start the API:

    pnpm --filter @advanced-quiz/api start

Useful runtime checks after the server starts:

    curl -i http://localhost:3001/health

Expected health response:

    HTTP/1.1 200 OK
    content-type: application/json; charset=utf-8
    ...
    {"status":"ok","timestamp":"2026-03-14T...Z"}

## Validation and Acceptance

Acceptance requires all of the following to be true:

1. `pnpm --filter @advanced-quiz/api check-types` succeeds.
2. `pnpm --filter @advanced-quiz/api build` succeeds.
3. The API starts on Express and still serves `/health`.
4. Auth endpoints still set and clear `access_token` and `refresh_token` cookies with the same flags as before.
5. Protected routes still authenticate from the `access_token` cookie.
6. The chat stream endpoint still works with the existing web client transport and does not persist partial transcripts when the client aborts the stream.

Current validation status: items 1 and 2 are complete in this environment. Item 3 is verified up to Nest bootstrap and route registration but not the final socket bind because of sandbox restrictions. Items 4 through 6 remain behaviorally dependent on a local environment where the server can accept connections.

## Idempotence and Recovery

This migration is safe to repeat because it does not touch persisted data or database schema. The only risky surface is package installation and the streaming endpoint behavior. If the streaming endpoint regresses during implementation, the safe recovery path is to keep the Express bootstrap and auth migration in place and restore only `apps/api-new/src/ai/ai.controller.ts` from the prior revision while the Express adapter remains active. Package manifest changes can be retried safely with `pnpm install`.

## Artifacts and Notes

Pre-migration evidence:

    apps/api-new/src/main.ts imports FastifyAdapter and @fastify/cookie
    apps/api-new/src/auth/auth.controller.ts imports FastifyReply/FastifyRequest
    apps/api-new/src/auth/jwt.strategy.ts imports FastifyRequest
    apps/api-new/src/common/authenticated-request.ts extends FastifyRequest
    apps/api-new/src/ai/ai.controller.ts uses reply.hijack() and result.pipeUIMessageStreamToResponse(reply.raw, ...)

Reference implementation note:

    ai v6 exposes result.pipeUIMessageStreamToResponse(response, options)
    and accepts a Node ServerResponse, which Express Response already is.

## Interfaces and Dependencies

Use `@nestjs/platform-express` as the NestJS HTTP platform package. Use `express` and `cookie-parser` for runtime request, response, and cookie handling. Keep `@nestjs/common`, `@nestjs/core`, `@nestjs/passport`, and `@nestjs/swagger` usage unchanged except where Express request/response primitives are needed. Keep AI SDK usage on `streamText`, `convertToModelMessages`, `createIdGenerator`, and `UIMessage`, and add `consumeStream` from `ai` for stream-abort handling.

Revision note: created to guide and record the Fastify-to-Express migration before implementation began.

Revision note: updated after implementation to record the completed Express migration, the required escalated package install, and the sandbox port-binding limitation encountered during runtime validation.
