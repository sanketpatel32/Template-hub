# DETAILS

## Environment Variables
Required:
- PORT
- APP_ENV
- CORS_ORIGIN
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX
- LOG_LEVEL
- LOG_PRETTY
- TRUST_PROXY
- SHUTDOWN_TIMEOUT_MS
- METRICS_ENABLED
- TRACE_ENABLED

## Response Contracts
Success:
```go
type SuccessResponse[T any] struct {
    Success bool `json:"success"`
    Data T `json:"data"`
    Meta map[string]any `json:"meta,omitempty"`
}
```

Errors use RFC7807-style problem details fields:
`type`, `title`, `status`, `detail`, `instance`, `requestId`, `traceId`, `spanId`.

## Middleware Order
1. request ID
2. request context / trace context
3. security headers
4. CORS
5. gzip compression
6. request logging
7. rate limit
8. routes
9. not found
10. centralized error handling

## Observability
- Structured logs via `log/slog`
- Pretty text logs in development, JSON in production
- Prometheus request counter and duration histogram
- `/metrics` endpoint
- Request/trace/span IDs in responses and error payloads

## Runtime Hardening
- Readiness state
- Signal-based shutdown handling
- Timeout-aware graceful shutdown

## Docker
```bash
docker build -t gin-go-backend .
docker run --rm -p 8080:8080 --env-file .env gin-go-backend
```
