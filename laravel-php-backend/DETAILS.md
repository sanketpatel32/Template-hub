# DETAILS: laravel-php-backend

## Architecture overview
- API-first, thin controller + middleware flow.
- Typed app errors in `app/Errors` normalized by `ErrorMap`.
- Request correlation via `x-request-id`, `x-trace-id`, generated `x-span-id`.
- Observability in `app/Observability` (logger, metrics, tracing).
- Readiness and lifecycle state in `app/State/Readiness`.

## Error model
- RFC7807 problem details are the only error contract.
- `AppError` captures status/code/title/detail/type/operational/errors/meta.
- Subclasses include: validation, auth, authorization, not found, conflict, rate limit, external, service unavailable, internal server.
- Unknown exceptions map to `InternalServerError`.

## Logging and tracing
- Structured JSON logs by default, pretty logs in local if enabled.
- Redacts common sensitive keys (`password`, `token`, `secret`, `authorization`).
- Correlation fields: `requestId`, `traceId`, `spanId`.
- Trace spans are emitted to stderr JSON when `TRACE_ENABLED=true`.

## Metrics and readiness
- `/metrics` exposes Prometheus text format.
- Includes request counter and duration histogram buckets.
- `/ready` reads shared readiness state and returns 503 when not ready.

## Environment reference
| Variable | Required | Description |
|---|---|---|
| `APP_PORT` | yes | server port |
| `APP_ENV` | yes | runtime env name |
| `APP_DEBUG` | yes | debug mode |
| `APP_KEY` | yes | app key placeholder |
| `APP_URL` | yes | public URL |
| `CORS_ORIGIN` | yes | allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | yes | rate-limit window |
| `RATE_LIMIT_MAX` | yes | max requests per window |
| `LOG_LEVEL` | yes | log level |
| `LOG_PRETTY` | yes | pretty logs toggle |
| `TRUST_PROXY` | yes | trust proxy toggle |
| `SHUTDOWN_TIMEOUT_MS` | yes | shutdown timeout target |
| `METRICS_ENABLED` | yes | metrics endpoint toggle |
| `TRACE_ENABLED` | yes | trace export toggle |

## Shutdown/runtime behavior
- Readiness helper supports flip to not-ready for graceful stop workflows.
- `SHUTDOWN_TIMEOUT_MS` is documented for lifecycle orchestration and tests.
- Fatal/runtime exceptions are normalized and logged.

## Security / production cautions
- Configure strict CORS origin (avoid `*` in production).
- Disable pretty logs in production to reduce volume.
- Treat this as a bootstrap template: add auth, persistence, secrets mgmt, and hardened infra settings before shipping.

## Troubleshooting
- If `composer install` cannot reach package mirrors, run syntax checks with `composer lint` and smoke tests with `composer test`.
- Ensure `.env` exists and all required env vars are present.
