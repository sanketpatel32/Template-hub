# DETAILS

## Architecture
- `cmd/api/main.go`: startup and config bootstrapping.
- `internal/config`: typed env loading.
- `internal/app`: app composition, middleware order, lifecycle.
- `internal/middleware`: request ID, tracing, logging, error mapping.
- `internal/errors`: typed app errors mapped to RFC7807 Problem Details.
- `internal/routes`: endpoint registration + OpenAPI/docs exposure.
- `internal/observability`: logger, metrics, trace/span ID helpers.
- `internal/state`: readiness state.
- `internal/types`: response and problem contracts.
- `tests`: black-box API/lifecycle tests.

## Middleware flow
1. request ID
2. trace context
3. security headers
4. CORS
5. compression
6. request logging + metrics
7. rate limit
8. routes
9. not found
10. centralized error handling

## Error contract
Problem Details payload includes:
- `type`, `title`, `status`, `detail`, `instance`
- `requestId`, `traceId`, `spanId`

## Runtime hardening
- signal handling (`SIGINT`, `SIGTERM`)
- shutdown timeout via `SHUTDOWN_TIMEOUT_MS`
- readiness flips false before shutdown drains

## Tooling
- format: `gofmt`
- lint: `golangci-lint`
- test: `go test ./...`
- hooks: `pre-commit`

## Docker
```bash
docker build -t fiber-go-backend .
docker run --env-file .env.example -p 3000:3000 fiber-go-backend
```
