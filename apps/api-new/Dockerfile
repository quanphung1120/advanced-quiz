FROM oven/bun:1.3.10-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS prepare
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @advanced-quiz/api --docker

FROM base AS installer
COPY --from=prepare /app/out/json/ .
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=prepare /app/out/full/ .
COPY --from=installer /app/ .
RUN bun turbo build --filter=@advanced-quiz/api

FROM base AS runner
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 appuser -G appgroup

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Preserve the pruned workspace layout so Bun can resolve workspace-linked
# packages and app-local dependencies in production.
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/apps/api-new ./apps/api-new
COPY --from=builder --chown=appuser:appgroup /app/packages/config ./packages/config
COPY --from=builder --chown=appuser:appgroup /app/packages/contracts ./packages/contracts

USER appuser
WORKDIR /app/apps/api-new

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -nv -t1 --spider http://localhost:3001/health || exit 1

CMD ["sh", "-c", "bun run db:migrate:deploy && bun run start"]
