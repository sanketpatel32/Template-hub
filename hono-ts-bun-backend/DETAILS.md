# Hono Template Details

Starter onboarding lives in [`README.md`](./README.md).  
Agent workflow and guardrails live in [`AGENTS.md`](./AGENTS.md).

## Architecture Overview
This project is a production-oriented Hono + TypeScript + Bun backend template.

### Core Structure
- `src/app.ts`: Hono app composition and middleware order.
- `src/server.ts`: HTTP bootstrap and process signal/error handlers.
- `src/server-lifecycle.ts`: Graceful shutdown lifecycle helper.
- `src/config/`: Environment schema and OpenAPI document source.
- `src/errors/`: Typed error hierarchy and unknown error mapping.
- `src/middleware/`: Request ID/context, rate-limit, not-found, and error middleware.
- `src/observability/`: Structured logger, tracing, and Prometheus metrics support.
- `src/routes/`: Route modules (`health`, `ready`, `metrics`, `ping`).
- `src/state/`: Runtime readiness state.
- `src/types/`: Shared API and request-context typings.

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
All errors are normalized as Problem Details payloads via the centralized error handler.

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
- Subclasses: validation/auth/authz/not-found/conflict/rate-limit/external/service-unavailable/internal
- Unknown errors are normalized by `mapToAppError`

## Logging and Tracing
- Structured logs use `pino`.
- Production defaults to JSON logs.
- Development can enable pretty logs with `LOG_PRETTY=true`.
- Correlation fields are included when available:
  - `requestId`
  - `traceId`
  - `spanId`
- Lightweight internal tracing emits span JSON to console when `TRACE_ENABLED=true`.

## Metrics and Readiness
- `/metrics` exposes Prometheus-formatted metrics.
- Includes default/process metrics and HTTP request counter + duration histogram.
- `/health` is liveness.
- `/ready` is readiness and returns `503` during shutdown flow.

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
| `TRUST_PROXY` | boolean | `true` | Reserved for proxy deployments |
| `SHUTDOWN_TIMEOUT_MS` | number | `10000` | Graceful shutdown timeout |
| `METRICS_ENABLED` | boolean | `true` | Enables `/metrics` |
| `TRACE_ENABLED` | boolean | `true` | Enables trace span export |

## Graceful Shutdown Behavior
- Handles `SIGINT` and `SIGTERM` with controlled drain logic.
- Flips readiness state to false before stopping the server.
- Handles `uncaughtException` and `unhandledRejection` with fatal logs and controlled exit.
- Enforces a force-exit timeout using `SHUTDOWN_TIMEOUT_MS`.

## Security and Production Cautions
- Middleware baseline includes secure headers, CORS, compression, and rate limiting.
- Sensitive fields are redacted in logs (`authorization`, cookies, token/password/secret style keys).
- `/metrics` is public in this template; restrict via network/ingress controls in production.

## Troubleshooting Notes
- Startup failures usually indicate invalid env schema values.
- Missing correlation IDs usually indicate middleware order drift in `src/app.ts`.
- Persistent `503` from `/ready` means shutdown mode has been entered.
- Unexpected `429` can indicate proxy/client IP collisions in local rate-limit keying.
