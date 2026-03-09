# Centralize Web UI Primitives Around Base UI

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

After this change, the web frontend will have one consistent shared UI layer for dialogs and form controls instead of several overlapping one-off implementations. A contributor will be able to build new dialogs and forms in a shadcn-like way by composing shared components from `apps/web-new/src/components/ui`, while the actual accessibility primitives continue to come from Base UI where they are already in use. You can see the change working by opening the dashboard collection flows and auth pages: the existing screens should behave the same, but their code should now reuse the same dialog, field, input, textarea, and alert primitives.

## Progress

- [x] (2026-03-09 10:53Z) Audited `apps/web-new/src/components/ui` and the feature/auth forms that duplicate dialog and field markup.
- [x] (2026-03-09 10:56Z) Confirmed the main duplication hotspots are the split dialog abstractions (`dialog.tsx` plus `modal.tsx`) and repeated input/label/error styling in collection, flashcard, collaborator, and auth forms.
- [x] (2026-03-09 11:08Z) Added shared Base UI-backed dialog composition primitives and shared form primitives in `apps/web-new/src/components/ui`.
- [x] (2026-03-09 11:08Z) Migrated collection, flashcard, collaborator, and delete dialogs to the shared dialog and field components.
- [x] (2026-03-09 11:08Z) Migrated auth pages to the shared field, input, and alert components.
- [x] (2026-03-09 11:14Z) Ran `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint`.
- [x] (2026-03-09 11:15Z) Replaced `watch("password")` with `useWatch(...)` in auth forms to satisfy the React compiler lint rule.

## Surprises & Discoveries

- Observation: the repository already used Base UI for button, tabs, tooltip, and low-level dialog pieces, but dialog consumers were split across two abstraction levels.
  Evidence: `apps/web-new/src/components/ui/dialog.tsx` exported raw styled primitives while `apps/web-new/src/components/ui/modal.tsx` added an entirely separate shell, and `apps/web-new/src/features/collections/components/delete-deck-dialog.tsx` rebuilt the shell again.
- Observation: auth pages repeated the same input, label, and alert styling, so limiting the refactor to dashboard modals would leave another obvious duplication cluster untouched.
  Evidence: `apps/web-new/src/features/auth/components/sign-in-page.tsx`, `sign-up-page.tsx`, `forgot-password-page.tsx`, `reset-password-page.tsx`, and `verify-email-page.tsx` each defined local `inputClass`, `labelClass`, and alert class constants.
- Observation: the repo’s lint configuration enforces the React compiler compatibility rule for React Hook Form’s `watch()` API.
  Evidence: the first `pnpm --filter @advanced-quiz/web lint` run warned in `reset-password-page.tsx` that `watch()` is incompatible with compiler memoization, and the warning disappeared after switching to `useWatch(...)`.

## Decision Log

- Decision: keep `apps/web-new/src/components/ui/modal.tsx` as a thin compatibility wrapper instead of deleting it immediately.
  Rationale: current feature code already imports `Modal`, and preserving that API while moving it onto the new dialog composition minimizes migration risk while still centralizing implementation.
  Date/Author: 2026-03-09 / Codex
- Decision: use Base UI only for dialog composition in this refactor and keep text inputs/textareas as styled native controls.
  Rationale: Base UI usage is already established for dialog behavior and accessibility, while native inputs integrate cleanly with React Hook Form via refs and do not require introducing additional uncertain primitives.
  Date/Author: 2026-03-09 / Codex
- Decision: include auth forms in the same refactor.
  Rationale: they repeat the same field and alert patterns as the dashboard flows, so excluding them would leave the most obvious duplication in place.
  Date/Author: 2026-03-09 / Codex

## Outcomes & Retrospective

The refactor consolidates the duplicated frontend component patterns into a predictable `components/ui` layer and removes the biggest inconsistency: multiple dialog APIs on top of Base UI. Validation now passes with `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint`. Follow-up work can centralize additional higher-level patterns such as selectable option cards if those start repeating elsewhere.

## Context and Orientation

This repository is a Turborepo monorepo. The React frontend lives in `apps/web-new`. Shared frontend primitives live in `apps/web-new/src/components/ui`. Base UI is already installed in `apps/web-new/package.json` as `@base-ui/react` and is currently used in `button.tsx`, `tabs.tsx`, `tooltip.tsx`, and `dialog.tsx`.

The current dialog stack is inconsistent. `apps/web-new/src/components/ui/dialog.tsx` contains styled wrappers over Base UI dialog pieces such as the portal, backdrop, and popup. `apps/web-new/src/components/ui/modal.tsx` then creates a second, more opinionated abstraction with title, description, body spacing, and a close button. Finally, `apps/web-new/src/features/collections/components/delete-deck-dialog.tsx` ignores `Modal` and reconstructs a custom dialog shell itself. This means there is no single blessed way to build dialogs.

The form controls have a similar problem. `apps/web-new/src/features/collections/components/collection-form-modal.tsx`, `apps/web-new/src/features/flashcards/components/flashcard-form-modal.tsx`, `apps/web-new/src/features/collections/components/add-collaborator-modal.tsx`, and the auth pages under `apps/web-new/src/features/auth/components/` all repeat label classes, input classes, textarea classes, and error panel classes inline.

In this plan, “shadcn-like” means each shared primitive lives in its own file under `apps/web-new/src/components/ui` and exports predictable, composable parts such as `DialogContent`, `DialogHeader`, `FieldLabel`, and `Input`, rather than forcing every caller through one rigid wrapper or rebuilding the structure manually.

## Plan of Work

First, update `apps/web-new/src/components/ui/dialog.tsx` so it becomes the single source of truth for dialog composition. Keep the existing Base UI foundation, but add the composed parts missing today: `Dialog`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogBody`, `DialogFooter`, `DialogTitle`, `DialogDescription`, and a default close button. Preserve compatibility exports used by older code so migrations can be incremental.

Next, add shared form primitives in `apps/web-new/src/components/ui/field.tsx`, `input.tsx`, `textarea.tsx`, and `alert.tsx`. `field.tsx` should provide label, description, and error helpers with the uppercase label styling currently repeated across the app. `input.tsx` and `textarea.tsx` should hold the common border, spacing, and focus states. `alert.tsx` should provide the success and destructive panels repeated through the auth flows.

Then, refactor the feature dialogs in `apps/web-new/src/features/collections/components/collection-form-modal.tsx`, `add-collaborator-modal.tsx`, `delete-deck-dialog.tsx`, and `apps/web-new/src/features/flashcards/components/flashcard-form-modal.tsx` to use the shared components. The goal is to remove duplicated layout, not to change user-visible behavior.

Finally, refactor the auth pages in `apps/web-new/src/features/auth/components/` to use the new `FieldLabel`, `FieldError`, `Input`, and `Alert` helpers. This keeps the auth flows aligned with the shared design system and proves the primitives are usable outside modals.

## Concrete Steps

Run the following commands from the repository root at `/home/lenovo/advanced-quiz`.

1. Inspect the duplicated UI patterns.

      rg -n "inputClass|labelClass|errorPanelClass|<Modal|DialogRoot" apps/web-new/src

2. Implement the shared primitives and migrate the affected files.

      git diff -- apps/web-new/src/components/ui apps/web-new/src/features apps/web-new/src/routes execplans/base-ui-component-centralization.md

3. Validate the web workspace.

      pnpm --filter @advanced-quiz/web check-types
      pnpm --filter @advanced-quiz/web lint

Expected successful validation transcript:

    > @advanced-quiz/web check-types
    > tsc -b

    > @advanced-quiz/web lint
    > eslint .

## Validation and Acceptance

Acceptance is behavioral and structural.

Behaviorally, the dashboard collection flows must still open and close their dialogs correctly, with the same form submission behavior as before. The delete collection confirmation must still require the typed name before enabling deletion. The collaborator invite flow must still search, select a role, and submit. The auth pages must still render the same fields and continue showing validation and success/error messages.

Structurally, the shared component layer should now contain reusable files for dialog, fields, input, textarea, and alert states under `apps/web-new/src/components/ui`, and the migrated consumers should stop defining their own repeated style constants for those concerns.

Validation commands are `pnpm --filter @advanced-quiz/web check-types` and `pnpm --filter @advanced-quiz/web lint`. Both now complete successfully after replacing `watch("password")` with `useWatch(...)` in the auth forms.

## Idempotence and Recovery

This refactor is additive and safe to repeat. Re-running the edits should only reapply the same shared abstractions. The main recovery path is to keep the compatibility `Modal` wrapper intact while migrating callers; this prevents a partial migration from breaking other screens. If a migrated screen regresses, compare it with the preserved wrapper structure in `apps/web-new/src/components/ui/modal.tsx` and retry the migration without changing the external props.

## Artifacts and Notes

Important files touched by this plan:

    apps/web-new/src/components/ui/dialog.tsx
    apps/web-new/src/components/ui/modal.tsx
    apps/web-new/src/components/ui/field.tsx
    apps/web-new/src/components/ui/input.tsx
    apps/web-new/src/components/ui/textarea.tsx
    apps/web-new/src/components/ui/alert.tsx
    apps/web-new/src/features/collections/components/collection-form-modal.tsx
    apps/web-new/src/features/collections/components/add-collaborator-modal.tsx
    apps/web-new/src/features/collections/components/delete-deck-dialog.tsx
    apps/web-new/src/features/flashcards/components/flashcard-form-modal.tsx
    apps/web-new/src/features/auth/components/sign-in-page.tsx
    apps/web-new/src/features/auth/components/sign-up-page.tsx
    apps/web-new/src/features/auth/components/forgot-password-page.tsx
    apps/web-new/src/features/auth/components/reset-password-page.tsx
    apps/web-new/src/features/auth/components/verify-email-page.tsx

Revision note: created this ExecPlan during implementation to capture the chosen Base UI-centered refactor path and the migration scope. Updated after validation to record the React compiler lint warning and the `useWatch(...)` follow-up fix.

## Interfaces and Dependencies

In `apps/web-new/src/components/ui/dialog.tsx`, define exports that allow callers to compose dialogs in this shape:

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>...</DialogTitle>
          <DialogDescription>...</DialogDescription>
        </DialogHeader>
        <DialogBody>...</DialogBody>
        <DialogFooter>...</DialogFooter>
      </DialogContent>
    </Dialog>

The dialog implementation must continue to use `@base-ui/react/dialog` for the accessible root, portal, overlay, popup, title, description, and close behavior.

In `apps/web-new/src/components/ui/field.tsx`, define helpers for:

    Field
    FieldLabel
    FieldDescription
    FieldError

In `apps/web-new/src/components/ui/input.tsx` and `textarea.tsx`, define reusable styled native controls that accept the normal DOM props and forward refs so they work with React Hook Form’s `register(...)` API.

In `apps/web-new/src/components/ui/alert.tsx`, define a shared alert surface with at least `success` and `destructive` variants for the repeated auth and mutation feedback states.
