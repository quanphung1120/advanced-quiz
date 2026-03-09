ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=10.31.0
ARG TURBO_VERSION=2.8.14
ARG NGINX_VERSION=1.29.5

FROM node:${NODE_VERSION}-bookworm-slim AS builder
ARG PNPM_VERSION
ARG TURBO_VERSION

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY . .
RUN pnpm dlx turbo@${TURBO_VERSION} prune @advanced-quiz/web --docker

FROM node:${NODE_VERSION}-bookworm-slim AS installer
ARG PNPM_VERSION

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

ARG VITE_API_URL=https://aq-backend.quanphungg.me
ARG VITE_CLOUDINARY_CLOUD_NAME=duzlm9qwl
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME}

RUN pnpm turbo run build --filter=@advanced-quiz/web

FROM nginx:${NGINX_VERSION}-alpine AS runner

COPY --from=installer /app/apps/web-new/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/web-new/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
