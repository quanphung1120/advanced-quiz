```md
# Landing Page Swiss Redesign ExecPlan

## Purpose / Big Picture

Redesign the public landing page in `apps/web-new` so it presents the same product and the same information, but with a more premium Swiss / International Typographic Style treatment. After this change, a visitor should still see the current navigation, hero, feature set, stats, testimonials, pricing, and call-to-action in the same order, but the page should feel more structured, editorial, and conversion-focused instead of effect-heavy.

## Progress

- [x] (2026-03-09 15:35Z) Audited the current landing page structure and identified the user-visible sections and copy that must be preserved.
- [x] (2026-03-09 15:35Z) Created branch `feat/web-landing-page-redesign`.
- [x] (2026-03-09 15:50Z) Rebuilt `apps/web-new/src/routes/home-page.tsx` into a data-driven editorial layout while preserving the existing landing page copy, order, pricing logic, and CTA intent.
- [x] (2026-03-09 15:52Z) Added a minimal `landing-grid-surface` helper in `apps/web-new/src/globals.css` for the subtle background rhythm used by the hero and closing CTA.
- [x] (2026-03-09 15:56Z) Ran `pnpm run lint`, `pnpm run check-types`, and `pnpm --filter @advanced-quiz/web build`.

## Surprises & Discoveries

- Observation: The current landing page already has a well-defined information architecture and product copy, so the redesign should focus on visual system and layout rather than content strategy.
  Evidence: `apps/web-new/src/routes/home-page.tsx` contains a sticky header, hero, features grid, stats, testimonials, pricing toggle, CTA banner, and footer in a single file.

- Observation: The existing visual language leans on neon accents, glow effects, and a 3D hero treatment that conflict with the requested Swiss-style redesign.
  Evidence: The page uses `text-primary` lime accents, glow shadows, beam scan animation, and a radial highlight around the Cloudinary hero image.

- Observation: `pnpm run lint` reports an existing React Compiler warning outside the landing page files.
  Evidence: `apps/web-new/src/features/auth/components/reset-password-page.tsx:115` warns about `watch("password")` from React Hook Form; lint still exits successfully with 0 errors.

## Decision Log

- Decision: Keep the landing page redesign scoped to the existing route and content structure rather than introducing new sections.
  Rationale: The user explicitly requested a redesign, not a rebrand or a rewrite.
  Date/Author: 2026-03-09 / Codex

- Decision: Use a data-driven structure inside `home-page.tsx` so the copy remains easy to audit and edit.
  Rationale: The landing page includes repeated card-based sections that are easier to preserve accurately when represented as arrays.
  Date/Author: 2026-03-09 / Codex

- Decision: Remove the landing-page theme toggle and render the public page in a fixed neutral light presentation.
  Rationale: The requested visual system is white / black / neutral gray, while the existing theme tokens and toggle support a neon-accented dark mode that conflicts with the redesign direction.
  Date/Author: 2026-03-09 / Codex

## Outcomes & Retrospective

The landing page now keeps the same content model but presents it through a stricter editorial grid: thin borders, left-aligned hierarchy, rectangular panels, restrained motion, and a neutral-only palette. The implementation stayed scoped to the public landing page route and one small global helper class. Validation succeeded for lint, type-checking, and production build.

## Context and Orientation

The landing page lives in `apps/web-new/src/routes/home-page.tsx`. It currently imports:

- `useAuth` to switch CTA targets between auth and dashboard routes.
- Shared UI primitives from `apps/web-new/src/components/ui`, including `Button`, `Tabs`, `Tooltip`, and `ThemeToggle`.
- Framer Motion for reveal animation.
- A Cloudinary-hosted hero asset for the visual panel.

The current page sections, in order, are:

1. Sticky header with brand, anchor navigation, theme toggle, sign-in/dashboard, and get-started.
2. Hero with headline, supporting paragraph, two CTAs, trust bullets, and hero visual.
3. Features section with six cards.
4. Stats section with four metrics.
5. Testimonials section with three quotes.
6. Pricing section with monthly/annual tabs and three plans.
7. Closing CTA banner.
8. Footer.

The global theme tokens live in `apps/web-new/src/globals.css`. Any styling additions should be minimal and safe for the rest of the app.

## Plan of Work

Rewrite `apps/web-new/src/routes/home-page.tsx` into a cleaner, modular composition:

- Define top-level arrays for features, stats, testimonials, and pricing plans using the existing copy.
- Replace the current glow-heavy wrappers with restrained editorial blocks, thin dividers, and consistent spacing.
- Keep the Cloudinary hero asset, but place it inside a rectilinear framed panel that matches the page grid.
- Preserve auth-aware CTA behavior and pricing tabs.
- Reduce motion to subtle fade/slide reveals that support the layout rather than dominate it.

Then update `apps/web-new/src/globals.css` only where the landing page needs reusable grid/background helpers for the new composition.

## Concrete Steps

From `/home/lenovo/advanced-quiz`:

1. Edit `execplans/landing-page-swiss-redesign.md` to keep the plan current as work progresses.
2. Edit `apps/web-new/src/routes/home-page.tsx` to implement the redesigned layout.
3. If needed, edit `apps/web-new/src/globals.css` to add neutral landing-page helper classes.
4. Run:

       pnpm run lint
       pnpm run check-types
       pnpm --filter @advanced-quiz/web build

Expected result: all commands finish successfully. Current recorded result:

    pnpm run lint
    - Passed.
    - Reported 1 existing warning in apps/web-new/src/features/auth/components/reset-password-page.tsx:115.

    pnpm run check-types
    - Passed after fixing a type-only icon import and the stats array inference in home-page.tsx.

    pnpm --filter @advanced-quiz/web build
    - Passed.
    - Vite emitted a bundle-size warning for the main JS chunk; no build failure.

## Validation and Acceptance

Acceptance is satisfied when:

- The `/` route still presents the same core page content and section order as before.
- The page uses a black / white / neutral gray visual system with left-aligned, high-contrast typography.
- Feature cards, stats, testimonials, pricing, and CTA blocks feel structurally consistent and responsive from mobile to desktop.
- CTA behavior still routes correctly for signed-in and signed-out users.
- `pnpm run lint` and `pnpm run check-types` pass.
- `pnpm --filter @advanced-quiz/web build` completes successfully.

## Idempotence and Recovery

The edits are safe to repeat because they are limited to the landing page route and supporting styles. If a styling experiment fails, revert only the changed hunks in `home-page.tsx` or `globals.css`; do not touch unrelated repo changes such as the existing modification in `turbo.json`.

## Artifacts and Notes

Important current-state notes:

    Branch: feat/web-landing-page-redesign
    Unrelated dirty file before work: turbo.json

## Interfaces and Dependencies

The finished implementation must continue using:

- `react-router` `Link` for internal navigation.
- `useAuth` from `apps/web-new/src/features/auth/hooks/use-auth`.
- Shared `Button`, `TabsRoot`, `TabsList`, `TabsTab`, `TabsIndicator`, and `TabsPanel` components.
- `framer-motion` for lightweight reveal animations.
- `@cloudinary/react` `AdvancedImage` with the existing `hero-visual-new_qkd2sj` asset.

Revision note: Initial plan created after auditing the existing landing page so implementation can proceed with a preserved information architecture.

Revision note (2026-03-09): Updated the plan after implementation and validation to record the final scope, the removed theme toggle decision, and the successful command results.
```
