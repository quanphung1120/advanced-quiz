# Optimize monorepo Dockerfiles for clearer caching and leaner runtime images

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, the API and web containers will build faster from the same monorepo, copy less unnecessary material into runtime images, and remain straightforward enough that a new contributor can still trace each stage. The observable outcome is that each Dockerfile still builds its target app from the repository root, but the stages better match the Turborepo workspace graph and the API runtime image carries only the files it actually needs to boot and run database migrations.

## Progress

- [x] (2026-03-25 13:20Z) Audited the current `apps/api-new/Dockerfile`, `apps/web-new/Dockerfile`, `.dockerignore`, root `package.json`, root `turbo.json`, and the relevant workspace package manifests.
- [x] (2026-03-25 13:20Z) Created this ExecPlan and captured the intended validation path before editing files.
- [x] (2026-03-25 13:29Z) Refactored `apps/api-new/Dockerfile` to keep the existing `turbo prune` flow, add pnpm store caching, and reduce runtime contents to the API app plus its runtime workspace dependencies.
- [x] (2026-03-25 13:29Z) Refactored `apps/web-new/Dockerfile` to use the same base/pruner/builder structure and pnpm cache approach while preserving the nginx runtime.
- [x] (2026-03-25 13:29Z) Tightened `.dockerignore` so Docker context uploads skip repository planning and documentation files that are irrelevant to image builds.
- [x] (2026-03-25 13:33Z) Ran `pnpm run check-types` successfully.
- [x] (2026-03-25 13:34Z) Ran `pnpm run lint` successfully.
- [x] (2026-03-25 13:34Z) Attempted container-build validation and recorded that no supported container CLI is available in this WSL environment.
- [x] (2026-03-25 13:35Z) Fixed the API Docker builder stage to provide a placeholder `DATABASE_URL` for Prisma client generation during image builds.
- [x] (2026-03-25 13:35Z) Verified the failing path locally with `DATABASE_URL=... pnpm --filter @advanced-quiz/db build`.
- [x] (2026-03-25 13:39Z) Hardened the API Docker builder step to apply the placeholder `DATABASE_URL` with shell fallback semantics so empty platform-provided build args do not erase the default.
- [x] (2026-03-25 13:39Z) Verified the full `pnpm turbo run build --filter=@advanced-quiz/api` path succeeds even when `PRISMA_BUILD_DATABASE_URL` is explicitly empty.

## Surprises & Discoveries

- Observation: The API container cannot trivially switch to a pure production dependency install because runtime startup executes `pnpm --filter @advanced-quiz/db db:deploy`, and that script depends on the Prisma CLI, which is currently a `devDependency` of `packages/db`.
  Evidence: `packages/db/package.json` defines `"db:deploy": "prisma migrate deploy --config ./prisma.config.ts"` and lists `"prisma"` under `devDependencies`.

- Observation: The web Dockerfile already has a naturally small runtime stage because nginx serves only built static files and the nginx config.
  Evidence: `apps/web-new/Dockerfile` copies only `apps/web-new/nginx.conf` and `apps/web-new/dist` into the final stage.

- Observation: The current environment cannot execute Docker or an alternative container build tool, so image validation must happen on a machine with Docker, Podman, Buildah, or Nerdctl installed.
  Evidence: `docker version` returned "The command 'docker' could not be found in this WSL 2 distro", and `command -v podman || command -v buildah || command -v nerdctl` returned no result.

- Observation: Prisma config validation now happens during `prisma generate`, so the Docker build needs some `DATABASE_URL` value even though the build step does not connect to a real database.
  Evidence: Dokploy failed during `@advanced-quiz/db:build` with `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`, while `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/advanced_quiz?schema=public pnpm --filter @advanced-quiz/db build` succeeded locally.

- Observation: A Docker `ARG` default is not sufficient if the deployment platform injects the same build arg as an empty string, because that empty value replaces the Dockerfile default.
  Evidence: The builder stage now uses shell fallback expansion in the `RUN` command, and `PRISMA_BUILD_DATABASE_URL='' ... pnpm turbo run build --filter=@advanced-quiz/api` succeeds locally.

## Decision Log

- Decision: Keep both Dockerfiles separate instead of introducing shared generated snippets or a root-level base Dockerfile.
  Rationale: The user asked for simplicity and readability. Separate but stylistically aligned Dockerfiles are easier to follow than a more abstract container setup.
  Date/Author: 2026-03-25 / Codex

- Decision: Preserve `turbo prune --docker` as the monorepo packaging strategy for both apps.
  Rationale: This repository is a Turborepo workspace, and the current prune flow already aligns with the app/package split while avoiding full-monorepo dependency installation in builder stages.
  Date/Author: 2026-03-25 / Codex

- Decision: Optimize the API runtime by copying the precise runtime workspaces and build outputs it needs, but do not force a production-only dependency tree while runtime migrations still need the Prisma CLI.
  Rationale: A smaller image is useful, but a broken startup path is worse. This balances size reduction with the current runtime contract.
  Date/Author: 2026-03-25 / Codex

- Decision: Add BuildKit cache mounts for pnpm installs and raise the Dockerfile frontend syntax to `docker/dockerfile:1.7`.
  Rationale: The main repeated cost in both images is dependency installation. BuildKit cache mounts improve rebuild speed without making the Dockerfiles materially harder to read.
  Date/Author: 2026-03-25 / Codex

- Decision: Inject a placeholder `DATABASE_URL` only in the API builder stage through `PRISMA_BUILD_DATABASE_URL`.
  Rationale: Prisma client generation requires the variable to exist during build, but the build should not depend on a live deployment database or bake runtime secrets into the final image.
  Date/Author: 2026-03-25 / Codex

- Decision: Apply the placeholder at the `RUN` command with shell fallback expansion instead of relying on `ENV DATABASE_URL=${PRISMA_BUILD_DATABASE_URL}`.
  Rationale: This survives platforms that pass an empty build argument and would otherwise turn the build-time `DATABASE_URL` into an empty value.
  Date/Author: 2026-03-25 / Codex

## Outcomes & Retrospective

The API and web Dockerfiles now use the same high-level structure: a shared toolchain base, a Turborepo prune stage, a builder stage that installs dependencies from pruned manifests with a cached pnpm store, and a runtime stage tailored to the deployed surface. This keeps the Dockerfiles parallel and easier to maintain.

The API runtime image is leaner than before because it no longer copies every pruned workspace package into the final image. Instead, it carries only root workspace metadata, `node_modules`, `packages/contracts`, `packages/db`, and `apps/api-new`, which is the current runtime boundary implied by the API package graph and migration step. The web runtime remains nginx-only, which was already the right deployment shape.

Repository validation succeeded with `pnpm run check-types` and `pnpm run lint`. The specific Dokploy failure was reproduced at the package level and then addressed more robustly by applying a build-only placeholder `DATABASE_URL` with shell fallback semantics in the API Docker builder stage. The full `pnpm turbo run build --filter=@advanced-quiz/api` path now succeeds locally even when `PRISMA_BUILD_DATABASE_URL` is empty. Container-build validation still could not be completed in this session because the WSL environment does not have Docker or another supported container CLI installed. That is the remaining follow-up step on a Docker-capable machine.

## Context and Orientation

This repository lives at `/home/lenovo/advanced-quiz` and is a pnpm workspace managed by Turborepo. Deployable apps live under `apps/`, with the NestJS API in `apps/api-new` and the Vite React frontend in `apps/web-new`. Shared packages live under `packages/`, including `packages/contracts` and `packages/db`, which are both part of the API build graph.

The current Dockerfiles already use `turbo prune --docker`. In plain language, pruning means generating a reduced copy of the monorepo that contains only the package manifests and source files required for one target app and its internal dependencies. This is important here because the repository has many workspaces, but each container should install only what its app needs.

The API Dockerfile now uses four stages: a Node base image with pnpm enabled, a prune stage, a builder stage, and a runtime stage. Its runtime stage copies root workspace metadata, the installed workspace `node_modules`, `packages/contracts`, `packages/db`, and `apps/api-new`. The API starts by running `pnpm --filter @advanced-quiz/db db:deploy` and then `pnpm --filter @advanced-quiz/api start:prod`. That means the runtime image must retain pnpm workspace metadata, the database package, the API package, built output, and the Prisma migration tooling required by `db:deploy`.

The web Dockerfile now uses the same base, prune, and builder pattern before handing off to an nginx runtime stage. It still has a narrow runtime contract because nginx serves only the static site output in `apps/web-new/dist` and the config file in `apps/web-new/nginx.conf`.

## Plan of Work

First, rewrite `apps/api-new/Dockerfile` so its stage names and flow are explicit and consistent: base toolchain, pruner, build dependencies, application build, and runtime. Add BuildKit cache mounts around pnpm installs so repeated Docker builds reuse the pnpm store instead of redownloading packages. Keep the runtime image on the Node base because the entrypoint uses pnpm workspace commands, but copy only the root workspace metadata, root `node_modules`, `packages/contracts`, `packages/db`, and `apps/api-new` rather than the full pruned tree.

Second, rewrite `apps/web-new/Dockerfile` to mirror the same stage naming and pnpm cache approach. Keep the nginx runtime stage because it is already the right deployment model for a Vite static build. Preserve the existing build arguments for `VITE_API_URL` and `VITE_CLOUDINARY_CLOUD_NAME`, but keep their defaults development-friendly and neutral to fit the checked-in project setup.

Third, tighten `.dockerignore` so the prune stage does not receive repository planning files and docs that have no effect on application builds. Finally, validate what can be validated locally. At minimum, run Dockerfile lint-adjacent checks by attempting Docker builds if the environment permits them. If Docker is unavailable in the sandbox, run repository checks that still exercise the relevant package graph, then document the limitation and the commands that should be run in a Docker-capable environment.

## Concrete Steps

Run the following commands from `/home/lenovo/advanced-quiz` as the work proceeds:

    docker build -f apps/api-new/Dockerfile .

This should complete the pruned API build and produce an image that exposes port `3001`. In this session, this command could not be run because `docker` is not installed in the current WSL environment.

    docker build -f apps/web-new/Dockerfile .

This should complete the pruned web build and produce an nginx image that serves the built Vite assets on port `80`. In this session, this command could not be run because `docker` is not installed in the current WSL environment.

If Docker is unavailable in the current environment, run:

    pnpm run check-types

This does not prove the Dockerfiles build, but it does confirm that the workspace graph and buildable packages referenced by the Dockerfiles still typecheck after the refactor. This command succeeded on 2026-03-25.

Also run:

    pnpm run lint

This validates that the workspace remains lint-clean after the operational changes. This command also succeeded on 2026-03-25.

To verify the Prisma-related build path without Docker, run:

    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/advanced_quiz?schema=public pnpm --filter @advanced-quiz/db build

This exercises the same `prisma generate` step that failed in the container build. This command succeeded on 2026-03-25.

To verify the full API build path with an explicitly empty build arg, run:

    PRISMA_BUILD_DATABASE_URL='' sh -lc 'DATABASE_URL="${PRISMA_BUILD_DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/advanced_quiz?schema=public}" pnpm turbo run build --filter=@advanced-quiz/api'

This mirrors the Docker builder-stage fallback behavior and confirms that an empty platform-provided build arg no longer breaks Prisma client generation. This command succeeded on 2026-03-25.

## Validation and Acceptance

Acceptance is met when both Dockerfiles remain readable multi-stage builds, both still use `turbo prune --docker`, and the following behavior holds:

The API Dockerfile builds from the repo root, produces a runtime image that starts with `pnpm --filter @advanced-quiz/db db:deploy && pnpm --filter @advanced-quiz/api start:prod`, and no longer copies obviously unnecessary workspace directories into the final image.

The web Dockerfile builds from the repo root, produces a final nginx image containing only the nginx config and built frontend assets, and uses the same install/build caching pattern as the API build.

Any validation commands run during implementation complete successfully, and any environment limitation that blocks Docker validation is explicitly recorded here.

## Idempotence and Recovery

These edits are safe to repeat. Re-running the Docker builds should reuse cached pnpm dependencies where BuildKit is enabled. If a runtime failure appears after trimming copied directories in the API image, the safe recovery path is to restore only the missing package or metadata file to the runtime stage, not to copy the entire pruned repository back wholesale.

## Artifacts and Notes

Key pre-implementation facts:

    apps/api-new/Dockerfile already uses `pnpm dlx turbo@${TURBO_VERSION} prune @advanced-quiz/api --docker`.

    apps/web-new/Dockerfile already uses `pnpm dlx turbo@${TURBO_VERSION} prune @advanced-quiz/web --docker`.

    packages/db/package.json keeps the Prisma CLI in `devDependencies`, which constrains how far the API runtime image can be minimized while it still runs migrations on startup.

Validation evidence from this session:

    pnpm run check-types
    Tasks: 7 successful, 7 total

    pnpm run lint
    Tasks: 5 successful, 5 total

    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/advanced_quiz?schema=public pnpm --filter @advanced-quiz/db build
    ✔ Generated Prisma Client (7.5.0) to ./src/generated/prisma

    PRISMA_BUILD_DATABASE_URL='' sh -lc 'DATABASE_URL="${PRISMA_BUILD_DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/advanced_quiz?schema=public}" pnpm turbo run build --filter=@advanced-quiz/api'
    Tasks: 3 successful, 3 total

    docker version --format '{{.Server.Version}}'
    The command 'docker' could not be found in this WSL 2 distro.

## Interfaces and Dependencies

The API Dockerfile at `apps/api-new/Dockerfile` must continue to build the `@advanced-quiz/api` workspace and its internal dependencies, especially `@advanced-quiz/db` and `@advanced-quiz/contracts`. The runtime command must remain compatible with the existing package scripts in `apps/api-new/package.json` and `packages/db/package.json`.

The web Dockerfile at `apps/web-new/Dockerfile` must continue to build the `@advanced-quiz/web` workspace using the root Turborepo task graph and must continue to expose the Vite build through nginx using `apps/web-new/nginx.conf`.

Revision note: Created the initial ExecPlan after auditing the current Dockerfiles, workspace manifests, and Turbo configuration. The chosen scope focuses on Docker-only improvements that fit the current repository contract instead of broader package-script or runtime-architecture changes.

Revision note: Updated the plan after implementation to record the BuildKit cache decision, the `.dockerignore` tightening, the successful `check-types` and `lint` runs, and the environment limitation that blocked local container builds.

Revision note: Updated the plan after the Dokploy failure report to record Prisma's build-time `DATABASE_URL` requirement and the builder-stage placeholder fix.

Revision note: Updated the plan again after observing that an empty platform-provided build arg can erase a Docker `ARG` default; the builder stage now uses shell fallback expansion to stay robust in that case.
