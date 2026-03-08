FROM oven/bun:canary-debian

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run build --filter=@advanced-quiz/api

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app/apps/api-new

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["bun", "-e", "fetch('http://localhost:3001/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["sh", "-c", "bun run --cwd /app/packages/db db:deploy && bun run start"]
