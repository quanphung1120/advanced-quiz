# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=10.31.0
ARG TURBO_VERSION=2.8.14

# ─── Base ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# ─── Pruner ───────────────────────────────────────────────────────────────────
# Prune the monorepo to the minimal subset needed for this app.
FROM base AS pruner
ARG TURBO_VERSION
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune @advanced-quiz/api --docker

# ─── Installer ────────────────────────────────────────────────────────────────
# Install dependencies from the pruned package manifests first (better caching),
# then copy the full pruned source and build.
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@advanced-quiz/api

# ─── Runner ───────────────────────────────────────────────────────────────────
# Runtime image: workspace dependencies plus shared package source and API source.
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Root workspace metadata and dependencies.
COPY --from=installer /app/package.json ./package.json
COPY --from=installer /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=installer /app/node_modules ./node_modules

# Workspace packages: shared DB schema/client and migrations.
COPY --from=installer /app/packages ./packages

# API source and metadata.
COPY --from=installer /app/apps/api-new ./apps/api-new

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3001/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

# Run pending migrations (safe, idempotent) then start the API.
CMD ["sh", "-c", "pnpm --filter @advanced-quiz/db db:deploy && pnpm --filter @advanced-quiz/api start"]
