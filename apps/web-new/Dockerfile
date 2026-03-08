FROM oven/bun:canary-debian AS development

ENV NODE_ENV=development

WORKDIR /workspace

EXPOSE 5173

CMD ["sh", "-lc", "bun install && cd apps/web-new && bun run dev"]

FROM oven/bun:canary-debian AS runner

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

ARG VITE_API_URL
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}

RUN bun run build --filter=@advanced-quiz/web

WORKDIR /app/apps/web-new

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD ["bun", "-e", "fetch('http://localhost:80').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "80"]
