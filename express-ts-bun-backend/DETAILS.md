# Express Template Details

Starter onboarding lives in [`README.md`](./README.md).  
Agent workflow and guardrails live in [`AGENTS.md`](./AGENTS.md).

## Architecture Overview
This project is a production-oriented Express + TypeScript + Bun backend template.

### Core Structure
- `src/app.ts`: Express app composition and middleware order.
- `src/server.ts`: HTTP server bootstrap and signal/error handling.
- `src/server-lifecycle.ts`: Graceful shutdown lifecycle helper.
- `src/config/`: Environment loading/validation and Swagger setup.
- `src/errors/`: Typed error hierarchy and unknown error mapping.
- `src/middleware/`: Request ID/context, rate-limiting, not-found, and error middleware.
- `src/observability/`: Structured logging, HTTP logs, tracing scaffold, metrics.
- `src/routes/`: Route modules (`health`, `ready`, `metrics`, `ping`).
- `src/state/`: Runtime state such as readiness flags.
- `src/types/`: Shared API/context/Express typing.

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
- Structured app/request logs use `pino` + `pino-http`.
- Production: JSON logs.
- Development: pretty logs via `LOG_PRETTY=true`.
- Correlation fields are attached where available:
  - `requestId`
  - `traceId`
  - `spanId`
- Lightweight tracing scaffold emits console span JSON when `TRACE_ENABLED=true`.

## Metrics and Readiness
- `/metrics` exposes Prometheus-formatted metrics.
- Metrics include process/default and HTTP request-level measurements.
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
| `TRUST_PROXY` | boolean | `true` | Express trust proxy setting |
| `SHUTDOWN_TIMEOUT_MS` | number | `10000` | Graceful shutdown timeout |
| `METRICS_ENABLED` | boolean | `true` | Enables `/metrics` |
| `TRACE_ENABLED` | boolean | `true` | Enables trace span export |

## Runtime Hardening
- Handles `SIGINT`/`SIGTERM` with graceful shutdown.
- Marks service as not-ready before draining traffic.
- Handles `uncaughtException` and `unhandledRejection` with fatal logging and controlled exit behavior.

## Security and Production Cautions
- Security middleware baseline: Helmet, CORS, Compression, Rate Limiting.
- Sensitive values are redacted in logs (auth/cookie/token/password-style fields).
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
- Check lifecycle handling in server startup/shutdown path.

### Rate Limiting Behaving Unexpectedly
- Re-check `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
- Confirm proxy/trust configuration for your deployment environment.
