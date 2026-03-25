# ExecPlan: AI Controller Refactor

## Goals

1. **No empty sessions** – ChatSession rows are only created when the first message is submitted and the stream begins.
2. **Stay on `/chat` until LLM response** – UI navigates to `/dashboard/chat/:id` only after the first stream starts.
3. **Sub-agent title generation** – Clean background title generation after every first turn.
4. **AI Controller refactor** – Slim controller down to HTTP routing; move orchestration to AIService.

---

## Architecture

**New endpoint: `POST /api/v1/chat/sessions/stream`**
- Receives `{ messages: UIMessage[] }` with no existing session.
- Creates the session immediately, sets `X-Session-Id` response header, then streams.
- `onFinish` callback calls `persistCompletedTurn`.

**Existing endpoint: `POST /api/v1/chat/sessions/:id/stream`**
- Refactored: delegates to a `streamTurn` service method.

**Frontend:**
- Custom AI SDK transport for "no session" state that posts to the new endpoint.
- Reads `X-Session-Id` from response headers in `onFinish` and navigates.

---

## Status

- [x] Step 1: Backend – new `createAndStreamSession` endpoint + service method
- [x] Step 2: Backend – refactor `persistCompletedTurn` and title generation  
- [x] Step 3: Backend – slim `streamSession` handler
- [x] Step 4: Frontend – update `chat-api.ts`
- [x] Step 5: Frontend – custom transport for first-message
- [x] Step 6: Frontend – refactor `ChatThread` and `ChatPage`
- [x] Step 7: Type-check and smoke test – all 9 tasks PASSED, smoke test PASSED
