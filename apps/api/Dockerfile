# Build stage - using Debian-based image for full compatibility
FROM golang:1.25.4-trixie AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build a fully static binary with all optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o main .

# Final stage - using Alpine for minimal image size and security
FROM alpine:latest

WORKDIR /app

# Install CA certificates, timezone data, and curl for health checks
RUN apk --no-cache add ca-certificates tzdata curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy the static binary from builder
COPY --from=builder /app/main .

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3005

# Health check - adjust the endpoint as needed
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Run the binary
ENTRYPOINT ["./main"]
