FROM oven/bun:canary-debian AS builder

WORKDIR /app
RUN bun install -g turbo
COPY . .
RUN turbo prune @advanced-quiz/web --docker

FROM oven/bun:canary-debian AS installer

WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN bun install --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

ARG VITE_API_URL
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}

RUN bun run build --filter=@advanced-quiz/web

FROM nginx:1.27-alpine AS runner

COPY apps/web-new/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/web-new/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
