# Migrate `apps/web-new` to ShadCN with a Shared `packages/ui` Workspace

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

After this change, the frontend in `apps/web-new` will consume ShadCN components from a dedicated `packages/ui` workspace instead of relying only on the current custom primitives in `apps/web-new/src/components/ui`. A contributor will be able to run the official ShadCN CLI against the shared UI package, add or update components with the requested preset, and migrate screens one route at a time while preserving the application’s current theme colors. You can see the setup working by adding a component into `packages/ui`, importing it into `apps/web-new`, and confirming the web app still typechecks and lints.

## Progress

- [x] (2026-03-10 06:00Z) Read `PLANS.md`, the `shadcn` skill, and audited the existing frontend component usage plus theme token system in `apps/web-new`.
- [x] (2026-03-10 06:05Z) Probed the official CLI in a throwaway directory with `pnpm dlx shadcn@latest init --template vite --monorepo --preset auFywKm` to capture the exact monorepo file layout and resolved style name.
- [x] (2026-03-10 06:15Z) Confirmed the preset code `auFywKm` resolves to the `radix-lyra` style and creates paired `components.json` files for the app and shared UI package.
- [x] (2026-03-10 06:25Z) Added the initial monorepo ShadCN scaffold in this repository: `apps/web-new/components.json`, `packages/ui/package.json`, `packages/ui/components.json`, `packages/ui/tsconfig.json`, `packages/ui/eslint.config.js`, `packages/ui/src/lib/utils.ts`, and `packages/ui/src/styles/globals.css`.
- [x] (2026-03-10 06:30Z) Updated `apps/web-new` to depend on `@advanced-quiz/ui`, import shared ShadCN CSS support, and expose the shared UI alias in both app TypeScript configs.
- [x] (2026-03-10 06:40Z) Ran `pnpm install`, verified both ShadCN configs with `pnpm dlx shadcn@latest info`, and generated `button`, `input`, `alert`, `card`, `separator`, `label`, and `field` into `packages/ui/src/components`.
- [x] (2026-03-10 06:55Z) Migrated the auth route cluster (`sign-in`, `sign-up`, `forgot-password`, `reset-password`, and `verify-email`) to import shared ShadCN components from `@advanced-quiz/ui`.
- [x] (2026-03-10 07:00Z) Re-ran `pnpm --filter @advanced-quiz/ui check-types`, `pnpm --filter @advanced-quiz/ui lint`, `pnpm --filter @advanced-quiz/web check-types`, and `pnpm --filter @advanced-quiz/web lint`; all passed.
- [x] (2026-03-10 07:05Z) Ran `pnpm --filter @advanced-quiz/web build` to confirm Vite resolves the new shared UI package and stylesheet in a production build.
- [x] (2026-03-10 06:35Z) Checked the current official ShadCN Vite dark mode guide and aligned the app with that pattern by moving theme state into an app-local `ThemeProvider` plus dropdown mode toggle.
- [x] (2026-03-10 06:40Z) Migrated the remaining non-auth screens and modal flows to shared ShadCN components, including home-page tabs, dashboard collection tabs, collection/flashcard modals, collaborator invite flow, and destructive confirmation dialogs.
- [x] (2026-03-10 06:42Z) Removed the obsolete app-local `src/components/ui` primitive wrappers and re-ran `pnpm --filter @advanced-quiz/web check-types`, `pnpm --filter @advanced-quiz/web lint`, and `pnpm --filter @advanced-quiz/web build`; all passed.

## Surprises & Discoveries

- Observation: the requested preset code does not remain in `components.json`; the CLI resolves it to a named style.
  Evidence: probing `pnpm dlx shadcn@latest init --template vite --monorepo --preset auFywKm` created `components.json` files with `"style": "radix-lyra"`.
- Observation: the current app’s theme already uses semantic tokens, so preserving color is mainly a CSS-variable problem rather than a component-API problem.
  Evidence: `apps/web-new/src/globals.css` already defines `--background`, `--foreground`, `--primary`, `--accent`, `--border`, and `--ring`, and maps them through `@theme inline`.
- Observation: the heaviest migration surface is concentrated in auth forms.
  Evidence: the current import graph shows `button`, `field`, `input`, and `alert` dominate usage, and auth routes import all four together.
- Observation: the shared UI package trips `react-refresh/only-export-components` on generated ShadCN files that export helper constants like `buttonVariants`.
  Evidence: `pnpm --filter @advanced-quiz/ui lint` failed on `packages/ui/src/components/button.tsx` until the package-local ESLint config disabled that rule.
- Observation: the auth migration surfaced two compatibility gaps in the shared component set: `Alert` only exposes `default` and `destructive` variants, and `Button` does not support an `asChild` prop in this Base UI-backed preset.
  Evidence: `pnpm --filter @advanced-quiz/web check-types` failed until the success banners were normalized to default alerts and the sign-in verification shortcut was rendered as a normal `Link`.

## Decision Log

- Decision: use a real shared `packages/ui` workspace instead of an app-local `src/components/shadcn/ui` directory.
  Rationale: the user explicitly asked for the monorepo setup, and the current official CLI monorepo scaffold already models that structure cleanly for Turborepo.
  Date/Author: 2026-03-10 / Codex
- Decision: preserve the existing app theme tokens in `apps/web-new/src/globals.css` and keep the shared ShadCN stylesheet minimal.
  Rationale: the user asked to keep the current color identity, and the existing light and dark palettes are already defined accurately in the app stylesheet.
  Date/Author: 2026-03-10 / Codex
- Decision: follow the requested preset by resolving it through the official CLI, but store the resulting `radix-lyra` style in `components.json`.
  Rationale: this matches the CLI’s actual behavior and ensures later `shadcn add` commands remain consistent with the initialized preset.
  Date/Author: 2026-03-10 / Codex
- Decision: prefer a merge-style migration rather than reinstallation of existing UI primitives.
  Rationale: `apps/web-new/src/components/ui` is already used broadly, and overwriting it would create unnecessary regressions. The shared package gives us a safe migration boundary.
  Date/Author: 2026-03-10 / Codex
- Decision: disable `react-refresh/only-export-components` only in `packages/ui`.
  Rationale: the shared UI workspace is a component library rather than a Vite app surface, and ShadCN-generated files intentionally export helper values such as `buttonVariants`.
  Date/Author: 2026-03-10 / Codex
- Decision: follow the official ShadCN Vite dark mode guide with an app-local provider instead of introducing `next-themes` into the Vite app.
  Rationale: the current official guide for Vite still uses a lightweight local `ThemeProvider`, and the existing app already stored a theme preference in local storage with class-based light/dark switching.
  Date/Author: 2026-03-10 / Codex
- Decision: replace the old local primitive wrappers with direct imports from `@advanced-quiz/ui` and keep only a small app-local `Modal` convenience component.
  Rationale: the request was to move the frontend onto ShadCN rather than maintain a parallel local wrapper layer, but the modal helper still adds app-specific composition value without reintroducing direct primitive coupling.
  Date/Author: 2026-03-10 / Codex

## Outcomes & Retrospective

The repository now has the same structural boundary the current ShadCN monorepo scaffold expects, adapted to this workspace naming and the app’s existing theme tokens. `apps/web-new` now imports shared UI primitives directly from `@advanced-quiz/ui` across auth, home, dashboard, learning, collection, and flashcard flows, while the former app-local primitive wrappers have been removed. Dark mode and light mode are now driven through an app-local provider and mode toggle that follow the current official ShadCN Vite guidance. The main lesson from the probe is that the preset code is a one-time CLI input, while the working repository should retain the resolved style name and rely on CSS tokens for brand continuity.

## Context and Orientation

This repository is a Turborepo monorepo. The React frontend lives in `apps/web-new`. Shared reusable code lives in `packages/*`. Before this migration, the frontend had no shared UI package. Instead, the active design system lived entirely in `apps/web-new/src/components/ui`, which contains custom primitives such as `button.tsx`, `input.tsx`, `field.tsx`, `alert.tsx`, `card.tsx`, `dialog.tsx`, and `tabs.tsx`.

The current theme system is defined in `apps/web-new/src/globals.css`. That file already defines CSS variables for semantic colors and typography, then maps them into Tailwind v4 tokens with `@theme inline`. Light mode is stark black-on-white, while dark mode uses black backgrounds with a lime primary color. In this plan, “preserving the current color” means keeping those CSS variable values authoritative and making the new ShadCN components consume them rather than replacing them with preset defaults.

ShadCN in the final repository will have two configuration entry points. `apps/web-new/components.json` tells the CLI how the app imports the shared package. `packages/ui/components.json` tells the CLI where to generate the shared components themselves. The shared source files live under `packages/ui/src`.

The important files for this migration are:

`apps/web-new/package.json` because the app must depend on `@advanced-quiz/ui`.
`apps/web-new/components.json` because the app-level CLI config points to the shared package.
`apps/web-new/tsconfig.json` and `apps/web-new/tsconfig.app.json` because TypeScript must resolve `@advanced-quiz/ui/*` to the package source during local development.
`apps/web-new/src/globals.css` because it remains the authoritative color system.
`packages/ui/package.json` because it owns the ShadCN runtime dependencies.
`packages/ui/components.json` because it controls the generated shared components.
`packages/ui/src/styles/globals.css` because it provides the shared ShadCN Tailwind imports and source scanning.

## Plan of Work

First, make the monorepo-aware ShadCN configuration explicit. The app-level `components.json` must point `ui` and `utils` imports at `@advanced-quiz/ui`, while the package-level `components.json` must point all aliases at its own source tree. TypeScript in `apps/web-new` must also know how to resolve `@advanced-quiz/ui/*` to `../../packages/ui/src/*` so local typechecking succeeds before a package build exists.

Next, install the shared UI workspace dependencies declared in `packages/ui/package.json`. After installation, run the official CLI against `packages/ui` to add the first components. Start with the primitives needed for the auth flow: `button`, `input`, `alert`, `card`, `separator`, and `@shadcn/field`. Read the generated files before using them and adjust only what is necessary for compatibility with the current theme or route code.

Then migrate the first auth page, starting with `apps/web-new/src/features/auth/components/sign-in-page.tsx`. Replace imports from `@/components/ui/*` with imports from `@advanced-quiz/ui/components/*` where the new ShadCN components now exist. Update the page markup to follow ShadCN composition patterns such as `Field` plus `FieldLabel` plus `FieldError`, and use `flex` with `gap-*` instead of `space-y-*`.

Finally, validate the app. Run the workspace typecheck and lint commands for both `@advanced-quiz/ui` and `@advanced-quiz/web`, then do a manual smoke test of the sign-in route to confirm the new package-based components render with the same black/white light mode and lime-accent dark mode.

## Concrete Steps

Run these commands from the repository root at `/home/lenovo/advanced-quiz`.

1. Install dependencies for the new shared UI workspace.

      pnpm install

2. Confirm the CLI can read both ShadCN configs.

      pnpm dlx shadcn@latest info --cwd apps/web-new --json
      pnpm dlx shadcn@latest info --cwd packages/ui --json

3. Add the first shared components into `packages/ui`.

      pnpm dlx shadcn@latest add button input alert card separator @shadcn/field --cwd packages/ui

4. Validate TypeScript and lint after the component generation and the first route migration.

      pnpm --filter @advanced-quiz/ui check-types
      pnpm --filter @advanced-quiz/ui lint
      pnpm --filter @advanced-quiz/web check-types
      pnpm --filter @advanced-quiz/web lint

Expected proof after setup is:

    `packages/ui/src/components/button.tsx` exists,
    `packages/ui/src/components/field.tsx` exists,
    `apps/web-new/components.json` resolves `ui` to `@advanced-quiz/ui/components`,
    and both the shared package and the web app pass their validation commands.

## Validation and Acceptance

Acceptance for the setup milestone is structural and observable. The official CLI must recognize both `apps/web-new` and `packages/ui` as valid ShadCN projects. Adding components must place source files under `packages/ui/src/components` rather than under `apps/web-new/src/components/ui`. `apps/web-new` must keep its current theme colors when importing the new components.

Acceptance for the first migration milestone is route-specific. After starting the web app, navigating to the sign-in page must still show the auth form, validation errors must still render, the submit button must still work, and dark mode must still render a lime-accent primary action rather than the preset’s default grayscale values.

## Idempotence and Recovery

The configuration files in this plan are safe to reapply. Re-running the same edits should produce the same ShadCN config and alias state.

The main risky step is dependency installation plus CLI generation. Because the shared package is isolated under `packages/ui`, a failed `shadcn add` can be recovered by deleting or fixing only files in `packages/ui/src/components` and rerunning the same `add` command. Do not delete or overwrite the existing custom components in `apps/web-new/src/components/ui` during this migration.

## Artifacts and Notes

Evidence from the preset probe:

    pnpm dlx shadcn@latest init --template vite --monorepo --preset auFywKm
    ...
    apps/web/components.json -> "style": "radix-lyra"
    packages/ui/components.json -> "style": "radix-lyra"

Current migration hotspot:

    button imports: 17 files
    field imports: 9 files
    input imports: 8 files
    alert imports: 6 files

Revision note: rewrote this ExecPlan after probing the current official monorepo scaffold. The earlier app-local strategy was replaced with a shared `packages/ui` workspace because the user explicitly asked for the monorepo setup and the preset probe showed the current CLI already supports that path directly.

## Interfaces and Dependencies

At the end of the setup milestone, the following interfaces and dependencies must exist.

In `apps/web-new/components.json`, define:

    "$schema": "https://ui.shadcn.com/schema.json"
    "style": "radix-lyra"
    "tailwind.css": "../../packages/ui/src/styles/globals.css"
    "aliases.utils": "@advanced-quiz/ui/lib/utils"
    "aliases.ui": "@advanced-quiz/ui/components"

In `packages/ui/components.json`, define:

    "$schema": "https://ui.shadcn.com/schema.json"
    "style": "radix-lyra"
    "tailwind.css": "src/styles/globals.css"
    "aliases.components": "@advanced-quiz/ui/components"
    "aliases.utils": "@advanced-quiz/ui/lib/utils"

In `packages/ui/package.json`, depend on:

    class-variance-authority
    clsx
    lucide-react
    radix-ui
    react
    react-dom
    shadcn
    tailwind-merge
    tw-animate-css

In `apps/web-new/src/globals.css`, keep the existing `--background`, `--foreground`, `--primary`, `--accent`, `--border`, and `--ring` variables authoritative and map any additional ShadCN chart or sidebar tokens to values derived from the same palette so future shared components remain visually consistent.
