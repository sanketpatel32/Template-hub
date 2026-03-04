# FastAPI Template Details

Starter onboarding lives in [`README.md`](./README.md).  
Agent workflow and guardrails live in [`AGENTS.md`](./AGENTS.md).

## Architecture Overview
This project is a production-oriented FastAPI + Python backend template.

### Core Structure
- `src/app.py`: FastAPI app composition and middleware order.
- `src/server.py`: HTTP server bootstrap entrypoint.
- `src/server_lifecycle.py`: Graceful shutdown lifecycle helper.
- `src/config/`: Environment loading/validation and OpenAPI metadata setup.
- `src/errors/`: Typed error hierarchy and unknown error mapping.
- `src/middleware/`: Request ID/context, rate-limiting, and error handling.
- `src/observability/`: Structured logging, HTTP logs, tracing scaffold, metrics.
- `src/routes/`: Route modules (`health`, `ready`, `metrics`, `ping`).
- `src/state/`: Runtime state such as readiness flags.
- `src/types/`: Shared API/context typing.

### Scaffolded Placeholder Layers
- `src/controllers`
- `src/services`
- `src/repositories`
- `src/validators`
- `src/schemas`
- `src/lib`
- `src/jobs`
- `src/events`

## Error Model (RFC7807-Inspired)
The API uses layered typed errors and returns Problem Details style payloads:

```json
{
  "type": "https://api.example.dev/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Route not found: GET /missing",
  "instance": "/missing",
  "code": "NOT_FOUND",
  "requestId": "2b784...",
  "traceId": "a23f9..."
}
```

### Error Layers
- Base error: `AppError`
- HTTP/domain-style subclasses: validation, auth, forbidden, not-found, conflict, rate-limit, service unavailable, internal error
- Unknown errors are normalized through a central mapper before response

## Logging and Tracing
- Structured app/request logs use standard `logging` with JSON output in production.
- Production: JSON logs.
- Development: pretty logs via `LOG_PRETTY=true`.
- Correlation fields are attached where available:
  - `request_id`
  - `trace_id`
  - `span_id`
- Lightweight tracing scaffold emits span logs when `TRACE_ENABLED=true`.

## Metrics and Readiness
- `/metrics` exposes Prometheus-formatted metrics.
- Metrics include process/runtime and HTTP request-level measurements.
- `/health` is liveness.
- `/ready` is readiness and returns `503` during shutdown.

## Environment Variable Reference
| Name | Type | Default | Notes |
|---|---|---:|---|
| `PORT` | number | `3000` | HTTP server port |
| `NODE_ENV` | enum | `development` | `development`, `test`, `production` |
| `CORS_ORIGIN` | string | `*` | CSV list or `*` |
| `RATE_LIMIT_WINDOW_MS` | number | `900000` | Rate limit window |
| `RATE_LIMIT_MAX` | number | `100` | Max requests per window |
| `LOG_LEVEL` | enum | `info` | `debug`, `info`, `warn`, `error` |
| `LOG_PRETTY` | boolean | env-based | defaults `true` unless production |
| `TRUST_PROXY` | boolean | `true` | Trust forwarded client IP headers |
| `SHUTDOWN_TIMEOUT_MS` | number | `10000` | Graceful shutdown timeout |
| `METRICS_ENABLED` | boolean | `true` | Enables `/metrics` |
| `TRACE_ENABLED` | boolean | `true` | Enables trace span export |

## Runtime Hardening
- Handles request-level correlation IDs and trace IDs.
- Supports graceful-shutdown readiness signaling via `/ready`.
- Uses defensive error normalization for unknown exceptions.

## Security and Production Cautions
- Security baseline: CORS, compression, and rate limiting.
- Sensitive values are redacted in structured logs.
- `/metrics` is public by default in this template. Protect it at ingress/network boundaries in production.

## Troubleshooting Notes

### App Fails on Startup
- Verify `.env` values match `.env.example`.
- Check environment schema validation output.

### Log Noise or Missing Context
- Tune `LOG_LEVEL`.
- Toggle `LOG_PRETTY`.
- Confirm request ID/context middleware runs before logger middleware.

### Unexpected 503 from `/ready`
- Indicates the app entered shutdown/readiness-off flow.
- Check readiness state transitions.

### Rate Limiting Behaving Unexpectedly
- Re-check `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
- Confirm proxy/trust configuration for your deployment environment.
