# Optimize monorepo Dockerfiles for clearer caching and leaner runtime images

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with [PLANS.md](../PLANS.md).

## Purpose / Big Picture

After this change, the API and web containers will build faster from the same monorepo, copy less unnecessary material into runtime images, and remain straightforward enough that a new contributor can still trace each stage. The observable outcome is that each Dockerfile still builds its target app from the repository root, but the stages better match the Turborepo workspace graph and the API runtime image carries only the files it actually needs to boot and run database migrations.

## Progress

- [x] (2026-03-25 14:40Z) Patched the API Docker base stage to install `openssl` so Prisma can detect the system SSL library during build and runtime.
- [x] (2026-03-25 14:25Z) Reproduced the Dokploy failure locally with `pnpm turbo run build --filter=@advanced-quiz/api` in a workspace that had no repo-root `.env`.
- [x] (2026-03-25 14:25Z) Reworked Prisma client generation to inject a build-only placeholder `DATABASE_URL` when `db:generate` runs without an explicit environment value.
- [x] (2026-03-25 14:25Z) Removed the API Dockerfile's dependency on copying the repo-root `.env` into the builder stage.
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
- [x] (2026-03-25 13:42Z) Aligned the DB package with Turborepo’s official environment-variable guidance by declaring `DATABASE_URL` on the `build` task in `packages/db/turbo.json`.
- [x] (2026-03-25 13:42Z) Re-ran the API build path, `pnpm run check-types`, and `pnpm run lint` after the Turborepo config change.
- [x] (2026-03-25 13:48Z) Simplified the API Docker builder stage by removing the `PRISMA_BUILD_DATABASE_URL` build arg and using a fixed build-only placeholder `DATABASE_URL`.
- [x] (2026-03-25 13:56Z) Re-ran the API build path and repository checks after the simplification pass.
- [x] (2026-03-25 13:59Z) Switched the API build path to use the real root `.env` file for `DATABASE_URL` instead of a build-only placeholder value.
- [x] (2026-03-25 13:59Z) Updated Prisma config and Turbo hashing so the root `.env` file is loaded intentionally and affects task caching.
- [x] (2026-03-25 13:59Z) Verified the API build path, `pnpm run check-types`, and `pnpm run lint` with a temporary root `.env`, then removed the temporary file.

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

- Observation: Turborepo’s official environment-variable docs explicitly say that Strict Mode filters task runtime env to declared `env` and `globalEnv`, and that dependency packages with their own build step should declare the required variable in that package’s own `turbo.json`.
  Evidence: Turborepo docs state that Strict Mode only exposes variables listed in config and that when an app depends on a package build task, the package can declare its environment variable in its own `turbo.json` so rebuilds flow through the dependency graph.

- Observation: Once `packages/db/turbo.json` declares `DATABASE_URL` for the `build` task, a Docker build arg is no longer necessary for stability because the image build always uses the same non-secret placeholder value during Prisma client generation.
  Evidence: The API Dockerfile can set `DATABASE_URL` directly on the build command and still satisfy the same `pnpm turbo run build --filter=@advanced-quiz/api` path.

- Observation: A generic `import "dotenv/config"` in `packages/db/prisma.config.ts` is not enough to support a repo-root `.env` during Docker builds, because the Prisma scripts execute with `/app/packages/db` as the working directory.
  Evidence: The Docker builder now copies `/app/.env` into the pruned workspace root, and Prisma config explicitly loads `../../.env` relative to `packages/db/prisma.config.ts`.

- Observation: The repo-root `.env` is not present in the current workspace by default, so relying on it for `prisma generate` breaks both Dokploy and a plain local Turbo build.
  Evidence: `ls -la .env` returned `No such file or directory`, and `pnpm turbo run build --filter=@advanced-quiz/api` failed with `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`.

- Observation: `node:24.14.0-bookworm-slim` does not include the OpenSSL tooling Prisma expects to inspect, so Prisma falls back to `openssl-1.1.x` and emits warnings during image builds.
  Evidence: Dokploy logged `Prisma failed to detect the libssl/openssl version to use` and recommended `apt-get install -y openssl`.

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

- Decision: Declare `DATABASE_URL` on `packages/db`'s `build` task instead of only relying on Docker-side injection.
  Rationale: This matches Turborepo’s documented Strict Mode behavior and package-level environment-variable guidance, and it keeps cache invalidation correct for the DB package build.
  Date/Author: 2026-03-25 / Codex

- Decision: Prefer a fixed build-only placeholder `DATABASE_URL` in the API Dockerfile over a configurable build arg.
  Rationale: Simplicity and stability now matter more than configurability. The build step does not use a real deployment database, so a constant placeholder is easier to reason about and avoids deployment-platform differences around empty build args.
  Date/Author: 2026-03-25 / Codex

- Decision: Prefer the real root `.env` file over a Docker-only placeholder for the API build.
  Rationale: The user explicitly wants `DATABASE_URL` to come from `.env`, and this repository already uses dotenv-based config. Loading the root `.env` intentionally keeps build behavior aligned with local development rather than inventing a Docker-specific value.
  Date/Author: 2026-03-25 / Codex

- Decision: Add `.env` to Turborepo `globalDependencies`.
  Rationale: Turborepo’s docs note that file-based environment inputs must be included in hashing separately from `env`. Since the DB build now reads the root `.env` file directly, cache behavior should change when that file changes.
  Date/Author: 2026-03-25 / Codex

- Decision: Move the build-only `DATABASE_URL` fallback into `packages/db`'s `db:generate` script and stop copying the repo-root `.env` into the API Docker builder.
  Rationale: The failure reproduces outside Docker, so the durable fix is to make Prisma client generation self-sufficient for build workflows while keeping runtime migration and startup commands strict about real environment configuration.
  Date/Author: 2026-03-25 / Codex

- Decision: Remove root `.env` from Turborepo `globalDependencies`.
  Rationale: Once Prisma generation no longer depends on a repo-root `.env`, invalidating all build caches on `.env` changes adds churn without changing emitted build artifacts.
  Date/Author: 2026-03-25 / Codex

- Decision: Install `openssl` in the API Docker `base` stage.
  Rationale: Prisma runs both during the builder phase (`generate`) and at runtime (`migrate deploy`), so the shared base image should provide the system OpenSSL package once for both stages.
  Date/Author: 2026-03-25 / Codex

## Outcomes & Retrospective

The API and web Dockerfiles now use the same high-level structure: a shared toolchain base, a Turborepo prune stage, a builder stage that installs dependencies from pruned manifests with a cached pnpm store, and a runtime stage tailored to the deployed surface. This keeps the Dockerfiles parallel and easier to maintain.

The API runtime image is leaner than before because it no longer copies every pruned workspace package into the final image. Instead, it carries only root workspace metadata, `node_modules`, `packages/contracts`, `packages/db`, and `apps/api-new`, which is the current runtime boundary implied by the API package graph and migration step. The web runtime remains nginx-only, which was already the right deployment shape.

Repository validation originally succeeded only when a temporary root `.env` was created. After reproducing the failure again in a clean workspace with no root `.env`, the fix moved deeper into the DB package: `packages/db/scripts/prisma-generate.mjs` now injects a build-only placeholder `DATABASE_URL` only for Prisma client generation, and the API Docker builder no longer needs to copy `.env` into the build context. A follow-up deployment log then exposed a second container-only issue: Prisma warned that the slim Node image lacked OpenSSL detection support. The API Docker `base` stage now installs `openssl` so both build-time Prisma generation and runtime migrations see the expected system library. Container-build validation still could not be completed in this session because the WSL environment does not have Docker or another supported container CLI installed. That is the remaining follow-up step on a Docker-capable machine.

## Context and Orientation

This repository lives at `/home/lenovo/advanced-quiz` and is a pnpm workspace managed by Turborepo. Deployable apps live under `apps/`, with the NestJS API in `apps/api-new` and the Vite React frontend in `apps/web-new`. Shared packages live under `packages/`, including `packages/contracts` and `packages/db`, which are both part of the API build graph.

The current Dockerfiles already use `turbo prune --docker`. In plain language, pruning means generating a reduced copy of the monorepo that contains only the package manifests and source files required for one target app and its internal dependencies. This is important here because the repository has many workspaces, but each container should install only what its app needs.

The API Dockerfile now uses four stages: a Node base image with pnpm enabled, a prune stage, a builder stage, and a runtime stage. Its builder stage keeps a root `.env` file available for Prisma client generation, while its runtime stage copies root workspace metadata, the installed workspace `node_modules`, `packages/contracts`, `packages/db`, and `apps/api-new`. The API starts by running `pnpm --filter @advanced-quiz/db db:deploy` and then `pnpm --filter @advanced-quiz/api start:prod`. That means the runtime image must retain pnpm workspace metadata, the database package, the API package, built output, and the Prisma migration tooling required by `db:deploy`.

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

To verify the full API build path without a root `.env`, run:

    pnpm turbo run build --filter=@advanced-quiz/api

This exercises the same `build` graph that the API Dockerfile invokes and should now succeed even when no repo-root `.env` exists, because only Prisma client generation receives the build-only placeholder URL. This command should be run after the new `packages/db/scripts/prisma-generate.mjs` wrapper is in place.

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

    pnpm turbo run build --filter=@advanced-quiz/api
    Tasks: 3 successful, 3 total

    pnpm run check-types
    Tasks: 7 successful, 7 total

    pnpm run lint
    Tasks: 5 successful, 5 total

    docker version --format '{{.Server.Version}}'
    The command 'docker' could not be found in this WSL 2 distro.

## Interfaces and Dependencies

The API Dockerfile at `apps/api-new/Dockerfile` must continue to build the `@advanced-quiz/api` workspace and its internal dependencies, especially `@advanced-quiz/db` and `@advanced-quiz/contracts`. The runtime command must remain compatible with the existing package scripts in `apps/api-new/package.json` and `packages/db/package.json`.

The web Dockerfile at `apps/web-new/Dockerfile` must continue to build the `@advanced-quiz/web` workspace using the root Turborepo task graph and must continue to expose the Vite build through nginx using `apps/web-new/nginx.conf`.

Revision note: Created the initial ExecPlan after auditing the current Dockerfiles, workspace manifests, and Turbo configuration. The chosen scope focuses on Docker-only improvements that fit the current repository contract instead of broader package-script or runtime-architecture changes.

Revision note: Updated the plan after implementation to record the BuildKit cache decision, the `.dockerignore` tightening, the successful `check-types` and `lint` runs, and the environment limitation that blocked local container builds.

Revision note: Updated the plan after the Dokploy failure report to record Prisma's build-time `DATABASE_URL` requirement and the builder-stage placeholder fix.

Revision note: Updated the plan again after checking Turborepo’s official environment-variable documentation and aligning `packages/db/turbo.json` with the documented package-level `env` pattern for dependency builds.

Revision note: Updated the plan again during the simplicity/stability pass to remove the now-unnecessary Prisma build arg from the API Dockerfile and prefer a fixed build-only placeholder value.

Revision note: Updated the plan again after reproducing the failure locally without a root `.env`; the durable fix now lives in `packages/db` so Prisma client generation can use a build-only placeholder while Docker and local Turbo builds stop depending on copying `.env` into the builder context.

Revision note: Updated the plan again after Dokploy reported Prisma OpenSSL warnings; the API Docker `base` stage now installs `openssl` so Prisma can detect the system SSL library in both builder and runner stages.
