# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=10.31.0
ARG TURBO_VERSION=2.8.14
ARG NGINX_VERSION=1.29.5

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
RUN pnpm dlx turbo@${TURBO_VERSION} prune @advanced-quiz/web --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ARG VITE_API_URL=http://localhost:3001
ARG VITE_CLOUDINARY_CLOUD_NAME=
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME}

RUN pnpm turbo run build --filter=@advanced-quiz/web

FROM nginx:${NGINX_VERSION}-alpine AS runner

COPY --from=builder /app/apps/web-new/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web-new/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
