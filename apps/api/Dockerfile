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

# Final stage - using scratch for minimal image size and attack surface
FROM scratch

WORKDIR /app

# Copy CA certificates for HTTPS requests (from builder)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the static binary from builder
COPY --from=builder /app/main .

# Copy config directory if it exists
COPY --from=builder /app/config ./config

# Expose port
EXPOSE 8080

# Run the binary
ENTRYPOINT ["./main"]
