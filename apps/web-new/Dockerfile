# Base stage
FROM oven/bun:1.3.10-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Prune stage
FROM base AS pruner
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune @advanced-quiz/web --docker

# Builder stage
FROM base AS builder
# First install dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile

# Build the project
COPY --from=pruner /app/out/full/ .
RUN bun turbo build --filter=@advanced-quiz/web

# Development stage (used by docker-compose)
FROM base AS development
ENV NODE_ENV=development
EXPOSE 5173
# Command is usually overridden in compose.yaml
CMD ["bun", "run", "dev"]

# Runner stage
FROM nginx:alpine AS runner
# Copy build artifacts to nginx
COPY --from=builder /app/apps/web-new/dist /usr/share/nginx/html
# Custom nginx config for SPA routing
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -nv -t1 --spider http://localhost:80 || exit 1
CMD ["nginx", "-g", "daemon off;"]
