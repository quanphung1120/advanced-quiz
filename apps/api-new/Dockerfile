# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=10.31.0
ARG TURBO_VERSION=2.8.14
ARG PRISMA_BUILD_DATABASE_URL

FROM node:${NODE_VERSION}-bookworm-slim AS base
ARG PNPM_VERSION
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PNPM_STORE_DIR="/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate \
  && pnpm config set store-dir "${PNPM_STORE_DIR}"

FROM base AS pruner
ARG TURBO_VERSION
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune @advanced-quiz/api --docker

FROM base AS builder
ARG PRISMA_BUILD_DATABASE_URL
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
# Prisma client generation reads DATABASE_URL from prisma.config.ts during build,
# but it does not need a real deployment database connection.
RUN DATABASE_URL="${PRISMA_BUILD_DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/advanced_quiz?schema=public}" \
  pnpm turbo run build --filter=@advanced-quiz/api

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/contracts ./packages/contracts
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/apps/api-new ./apps/api-new

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3001/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

# Run pending migrations (safe, idempotent) then start the compiled API.
CMD ["sh", "-c", "pnpm --filter @advanced-quiz/db db:deploy && pnpm --filter @advanced-quiz/api start:prod"]
