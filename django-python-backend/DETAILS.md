# DETAILS.md

## Architecture Overview
- `project/settings.py`: Django config + middleware stack wiring.
- `project/env.py`: typed environment loading/validation.
- `project/middleware.py`: correlation, security headers, CORS, logging, rate limiting, and centralized error handling.
- `project/readiness.py`: readiness state + SIGTERM/SIGINT shutdown transitions.
- `apps/api/errors/`: typed `AppError` hierarchy and unknown error normalization.
- `apps/api/views/`: health/readiness/metrics/ping handlers.
- `project/openapi.py`: lightweight OpenAPI document.

## Error Model
All failures return RFC7807-style problem details:
- `type`, `title`, `status`, `detail`, `instance`, `code`
- correlation fields: `requestId`, `traceId`
- optional `errors` list

Unknown exceptions flow through `map_to_app_error` and become `InternalServerError`.

## Logging / Tracing
- Structured logging via Python logging + `python-json-logger` formatter in production.
- Pretty JSON lines in development.
- Sensitive fields are redacted (`authorization`, `cookie`, `token`, `secret`, etc.).
- Request middleware propagates/generates `requestId`, `traceId`, and `spanId`.
- When `TRACE_ENABLED=true`, a trace span log line is emitted per request.

## Metrics / Readiness
- Prometheus metrics are exposed at `/metrics` via `prometheus-client`.
- Includes request count and duration metrics.
- `/ready` depends on lifecycle readiness state.
- Signal handlers flip readiness to unavailable during shutdown.

## Environment Reference
| Variable | Required | Description |
|---|---|---|
| `PORT` | yes | HTTP port |
| `NODE_ENV` | yes | `development`, `test`, `production` |
| `CORS_ORIGIN` | yes | Allowed CORS origin value |
| `RATE_LIMIT_WINDOW_MS` | yes | Rate limit sliding window |
| `RATE_LIMIT_MAX` | yes | Max requests per window |
| `LOG_LEVEL` | yes | Python log level |
| `LOG_PRETTY` | yes | Pretty logs in non-prod |
| `TRUST_PROXY` | yes | Proxy-awareness toggle |
| `SHUTDOWN_TIMEOUT_MS` | yes | Graceful shutdown timeout |
| `METRICS_ENABLED` | yes | Toggle `/metrics` |
| `TRACE_ENABLED` | yes | Toggle per-request span logs |
| `DJANGO_SECRET_KEY` | yes | Django secret key |
| `DJANGO_ALLOWED_HOSTS` | yes | Comma-separated hosts |

## Runtime / Shutdown Behavior
- ASGI/WSGI entry points install signal handlers.
- Shutdown signal sets readiness false immediately.
- `/ready` emits HTTP 503 problem details while shutting down.

## Security / Production Cautions
- Keep strong `DJANGO_SECRET_KEY` in production.
- Restrict `DJANGO_ALLOWED_HOSTS` and `CORS_ORIGIN`.
- Do not lower rate limiting without traffic profiling.
- Keep correlation IDs enabled for incident triage.

## Troubleshooting
- Startup validation failure: check `project/env.py` error details.
- Missing metrics: ensure `METRICS_ENABLED=true`.
- Unexpected 429s: tune `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`.
- Missing IDs: verify correlation middleware remains before logging.
