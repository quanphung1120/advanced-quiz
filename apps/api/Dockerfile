# Build stage - using Debian-based image for full compatibility
FROM golang:1.25.4-trixie AS builder

WORKDIR /app

# Copy dependency files first for better layer caching
COPY go.mod go.sum ./

# Download dependencies with cache mount
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

# Copy source code
COPY . .

# Build with cache mounts for incremental compilation
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s' \
    -trimpath \
    -o main ./cmd/server


# Final stage - optimized Alpine
FROM alpine:latest

# Install only essential packages in a single layer
RUN apk --no-cache add \
    ca-certificates \
    tzdata \
    && addgroup -g 1001 -S appgroup \
    && adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Set ownership
RUN chown appuser:appgroup /app/main

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3005

# Optimized health check using wget (pre-installed in Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -nv -t1 --spider http://localhost:3005/health || exit 1

# Run the binary
ENTRYPOINT ["./main"]