# Remove Web Modal Wrapper And Standardize Dialog Forms

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/home/lenovo/advanced-quiz/PLANS.md) and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the web app will no longer route dialog usage through a local `Modal` wrapper. The remaining dialog forms will compose the shared dialog primitives directly, which keeps the UI closer to the installed ShadCN-style source components and removes an extra abstraction layer. At the same time, the collection, flashcard, and collaborator dialogs will all use `react-hook-form` with `zod` validation and existing React Query mutations backed by Axios API clients, so form state, validation, reset behavior, and submission errors all follow the same path already used elsewhere in `apps/web-new`.

You can see the result by opening the collection dashboard, launching the collection create/edit dialogs, the flashcard create/edit dialog, and the collaborator invite dialog. They should render the same dialog shell styling as before, validate required inputs before submit, reset when closed, and still submit through the existing React Query mutations.

## Progress

- [x] 2026-03-10 08:53Z Read `PLANS.md`, inspected the `Modal` wrapper, and identified the three active call sites in `apps/web-new`.
- [x] 2026-03-10 08:57Z Confirmed the repo already uses `react-hook-form`, `zod`, React Query, and Axios in `apps/web-new`, so no new library adoption is needed.
- [x] 2026-03-10 09:14Z Replaced the wrapper-based dialogs with direct dialog composition and RHF/Zod form state in the collection, flashcard, and collaborator flows.
- [x] 2026-03-10 09:15Z Removed `apps/web-new/src/components/modal.tsx` after confirming there were no remaining imports.
- [x] 2026-03-10 09:19Z Ran targeted verification: `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint` both completed successfully.

## Surprises & Discoveries

- Observation: The repository is already mid-migration toward shared UI primitives under `packages/ui`, and the working tree contains unrelated user changes.
  Evidence: `git status --short` showed many modified files outside the modal scope, including `packages/ui/` and several route components.

- Observation: The ShadCN CLI workflow described in the local skill file could not be refreshed from the network in this sandbox.
  Evidence: `pnpm dlx shadcn@latest info --json` failed with `EAI_AGAIN` while resolving `registry.npmjs.org`.

## Decision Log

- Decision: Limit the refactor to the three files that still import `@/components/modal` plus the wrapper file itself.
  Rationale: The user asked to remove the wrapper and standardize form handling, and the repo already contains many unrelated in-flight changes that should not be disturbed.
  Date/Author: 2026-03-10 / Codex

- Decision: Keep React Query mutations and Axios API clients in their existing hooks and API modules instead of moving submission logic into the form components.
  Rationale: The current architecture already routes writes through `useMutation` hooks and Axios-backed API clients. The inconsistency is in local form state and validation, not in transport or caching.
  Date/Author: 2026-03-10 / Codex

- Decision: Keep the flashcard dialog schema focused on the visible fields (`question` and `answer`) and inject `type` from existing props at submit time.
  Rationale: The dialog UI does not expose a `type` control. Treating it as a hidden RHF field added avoidable resolver typing friction without improving user-visible validation.
  Date/Author: 2026-03-10 / Codex

- Decision: Use `ToggleGroup` in single-select mode by passing a one-item `value` array for the collaborator role field.
  Rationale: The shared `ToggleGroup` component wraps Base UI, whose API models selection as an array even when `multiple` is false. This keeps the role selector on an installed UI primitive while remaining type-correct.
  Date/Author: 2026-03-10 / Codex

## Outcomes & Retrospective

The wrapper removal succeeded without widening the transport or cache layers. The three remaining dialog forms now compose `Dialog` primitives directly, validate with local `zod` schemas through `react-hook-form`, and continue submitting through the existing React Query mutation hooks and Axios-backed API modules. The collaborator dialog now also uses a controlled toggle-group role selector and Axios-aware mutation error messaging.

One unrelated cleanup was required to finish verification: `apps/web-new/src/routes/home-page.tsx` already had an unused `Icon` variable that caused `pnpm --filter @advanced-quiz/web lint` to fail. The fix was limited to rendering that icon in the existing card header so workspace linting could complete.

## Context and Orientation

The relevant frontend lives in `apps/web-new/src`. The wrapper being removed is `apps/web-new/src/components/modal.tsx`. It composes `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter` from the shared UI package, then accepts generic `title`, `description`, `footer`, and `children` props.

The wrapper is currently used in:

- `apps/web-new/src/features/flashcards/components/flashcard-form-modal.tsx`
- `apps/web-new/src/features/collections/components/collection-form-modal.tsx`
- `apps/web-new/src/features/collections/components/add-collaborator-modal.tsx`

Form submission already flows through React Query hooks backed by Axios API modules:

- `apps/web-new/src/features/flashcards/hooks/use-flashcards.ts`
- `apps/web-new/src/features/collections/hooks/use-collections.ts`
- `apps/web-new/src/features/flashcards/api/flashcards-api.ts`
- `apps/web-new/src/features/collections/api/collections-api.ts`

In this repository, `react-hook-form` manages browser form state, `zod` describes the allowed form shape and validation rules, React Query handles mutation state and cache invalidation, and Axios is the HTTP client used under the API modules. The auth screens in `apps/web-new/src/features/auth/components/*` already show the target pattern: `zodResolver(...)`, `useForm(...)`, `FieldGroup`, `Field`, `FieldContent`, and `FieldError`.

## Plan of Work

First, update each of the three wrapper-based dialog components so they import the shared dialog primitives directly from `@advanced-quiz/ui/components/dialog`. Preserve the visual structure that the wrapper provided by rendering the same `DialogContent`, padded body container, header, and optional footer structure inside each component instead of behind a generic wrapper.

Next, replace local `useState`-only form handling in those dialog components with `react-hook-form` and local `zod` schemas. The collection and flashcard dialogs should use `useForm` with `defaultValues`, call `reset(...)` when `initialValues` or `open` changes, and only pass trimmed/normalized values to their existing `onSubmit` prop. The collaborator dialog should use RHF for `email` and `role`, use `useWatch` plus `useDeferredValue` to drive the existing user search query, and surface mutation errors through a small Axios-aware message extractor in the component.

Finally, once no files import the wrapper, delete `apps/web-new/src/components/modal.tsx`, run targeted web checks, and update this plan with the exact verification outcome.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `execplans/modal-form-refactor.md` to keep the living sections current while implementing.
2. Edit `apps/web-new/src/features/flashcards/components/flashcard-form-modal.tsx` to:
   - remove `Modal`
   - add a local `zod` schema
   - use `useForm` and `zodResolver`
   - compose the dialog primitives directly
3. Edit `apps/web-new/src/features/collections/components/collection-form-modal.tsx` to:
   - remove `Modal`
   - validate `name`, optional `description`, and `isPublic`
   - use `Controller` for the `Switch`
   - compose the dialog primitives directly
4. Edit `apps/web-new/src/features/collections/components/add-collaborator-modal.tsx` to:
   - remove `Modal`
   - validate `email` and `role`
   - switch the role selector to a proper controlled form field
   - keep the search suggestions and mutation wiring intact
5. Delete `apps/web-new/src/components/modal.tsx` after import cleanup.
6. Run:

      pnpm --filter @advanced-quiz/web check-types
      pnpm --filter @advanced-quiz/web lint

## Validation and Acceptance

Acceptance is satisfied when:

- `rg -n "from \"@/components/modal\"|from '@/components/modal'" apps/web-new/src` returns no matches.
- `pnpm --filter @advanced-quiz/web check-types` succeeds without introducing type errors in the changed files.
- `pnpm --filter @advanced-quiz/web lint` succeeds for the web workspace.
- In the running app, opening each dialog still shows a title and description, closing a dialog clears unsaved state, required fields show inline validation errors, and successful submits still update the relevant collection or flashcard data through the existing React Query flows.

## Idempotence and Recovery

These edits are safe to repeat because they are additive until the wrapper file is deleted, and the wrapper should only be removed after search confirms there are no remaining imports. If a verification command fails, keep the code changes and fix the reported file directly rather than reverting unrelated workspace edits.

## Artifacts and Notes

Important discovery transcript:

    $ pnpm dlx shadcn@latest info --json
    WARN GET https://registry.npmjs.org/shadcn error (EAI_AGAIN)

Key wrapper import search before the refactor:

    apps/web-new/src/features/flashcards/components/flashcard-form-modal.tsx
    apps/web-new/src/features/collections/components/add-collaborator-modal.tsx
    apps/web-new/src/features/collections/components/collection-form-modal.tsx

Verification transcript after the refactor:

    $ pnpm --filter @advanced-quiz/web check-types
    > @advanced-quiz/web@0.0.1 check-types /home/lenovo/advanced-quiz/apps/web-new
    > tsc -b

    $ pnpm --filter @advanced-quiz/web lint
    > @advanced-quiz/web@0.0.1 lint /home/lenovo/advanced-quiz/apps/web-new
    > eslint .

## Interfaces and Dependencies

Use the existing dependencies already declared in `apps/web-new/package.json`:

- `react-hook-form` for form state
- `@hookform/resolvers/zod` for the `zodResolver`
- `zod` for validation schemas
- `@tanstack/react-query` for existing mutation hooks
- `axios` only through the existing API client stack or local error narrowing

At the end of the refactor, these component contracts should still exist:

- `FlashcardFormModalProps["onSubmit"]` remains `(values: FlashcardValues) => Promise<void>`
- `CollectionFormModalProps["onSubmit"]` remains `(values: CollectionValues) => Promise<void>`
- `AddCollaboratorModal` still accepts `collectionId`, `open`, and `onOpenChange`

Revision note: created this plan to cover the wrapper removal and form-standardization work before code changes begin.

Revision note: updated the plan after implementation to record the completed dialog refactor, the single-select toggle-group decision, and the successful verification commands.
