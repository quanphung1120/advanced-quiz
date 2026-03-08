# Base stage
FROM oven/bun:1.3.10-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Prune stage
FROM base AS pruner
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @advanced-quiz/api --docker

# Builder stage
FROM base AS builder
# First install dependencies (layer caching)
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile

# Build the project
COPY --from=pruner /app/out/full/ .
RUN bun turbo build --filter=@advanced-quiz/api

# Development stage (used by docker-compose)
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3001
# Command is usually overridden in compose.yaml, but provided for completeness
CMD ["bun", "run", "dev"]

# Runner stage
FROM base AS runner
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 appuser -G appgroup
USER appuser

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy build artifacts and dependencies
COPY --from=builder /app/apps/api-new/dist ./dist
COPY --from=builder /app/apps/api-new/package.json .
COPY --from=builder /app/apps/api-new/prisma ./prisma
COPY --from=builder /app/apps/api-new/prisma.config.ts .
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -nv -t1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["sh", "-c", "bun run db:migrate:deploy && bun run dist/index.js"]

