# DETAILS

## Environment variables
Required:
- `PORT`
- `APP_ENV` (`development|staging|production`)
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `LOG_LEVEL`
- `LOG_PRETTY`
- `TRUST_PROXY`
- `SHUTDOWN_TIMEOUT_MS`
- `METRICS_ENABLED`
- `TRACE_ENABLED`

## Request flow
1. Request ID + trace/span context
2. Security headers
3. CORS
4. Compression
5. Request logging + metrics
6. Rate limiting
7. Route handlers
8. Not found fallback
9. Error normalization

## Error contract
All non-2xx responses are normalized as RFC7807-style `ProblemDetails`:
- `type`, `title`, `status`, `detail`, `instance`
- correlation metadata: `requestId`, `traceId`, `spanId`
- `timestamp`

## Observability
- Structured logs via `tracing`/`tracing-subscriber`
- JSON logs in production mode, pretty local logs when `LOG_PRETTY=true`
- lightweight trace-export log line when `TRACE_ENABLED=true`
- Prometheus metrics at `/metrics`

## Runtime lifecycle
- Readiness state in `AppState`
- Graceful shutdown with signal handling (`SIGINT`/`SIGTERM`)
- Shutdown timeout bounded by `SHUTDOWN_TIMEOUT_MS`

## Tooling
- Format: `cargo fmt`
- Lint: `cargo clippy --all-targets --all-features -- -D warnings`
- Tests: `cargo test`
- Hooks: `.githooks/pre-commit` (run fmt, clippy, test)

Install hooks:
```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```
