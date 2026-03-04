# AGENTS.md

## Project Purpose
This repository is a production-focused NestJS + TypeScript + Bun backend template.  
It includes standardized error handling (RFC7807-style), structured logging, request tracing, metrics, and graceful shutdown behavior.
For quick project onboarding, see [`README.md`](./README.md).  
For consolidated system/runtime documentation, see [`DETAILS.md`](./DETAILS.md).

## Architecture Map
- `src/app.ts`: Nest app composition and middleware order.
- `src/app.module.ts`: Root Nest module and route controller registration.
- `src/server.ts`: HTTP server startup, process signal handlers, graceful shutdown wiring.
- `src/server-lifecycle.ts`: Reusable shutdown controller logic.
- `src/config/`: Runtime config and Swagger/OpenAPI setup.
- `src/errors/`: Typed application error hierarchy and unknown-error mapping.
- `src/middleware/`: Request ID/context, rate-limit, and error middleware/filter.
- `src/observability/`: Logger, HTTP logging, tracing scaffold, and Prometheus metrics support.
- `src/routes/`: Health/readiness/metrics/ping controllers.
- `src/state/readiness.ts`: Process readiness state used by `/ready`.
- `src/controllers/`, `src/services/`, `src/repositories/`: Placeholder app layers for feature implementation.
- `src/validators/`, `src/schemas/`: Validation and schema-specific modules.
- `src/lib/`, `src/jobs/`, `src/events/`: Shared libraries, async/background tasks, and event-driven handlers.
- `tests/`: Integration and unit-style tests.

## Local Commands
- Install: `bun install`
- Dev server: `bun run dev`
- Start server: `bun run start`
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Format: `bun run format`
- Tests: `bun run test`
- Test watch: `bun run test:watch`

## Development Workflow
1. Add or update route logic under `src/routes/`.
2. Add middleware or service changes in dedicated modules; avoid bloating `app.ts`.
3. Throw typed errors from `src/errors/http-errors.ts` for all expected failures.
4. Let `src/middleware/error-handler.ts` normalize failures to Problem Details.
5. Add/adjust tests in `tests/` for every behavior change.
6. Run `bun run lint`, `bun run typecheck`, and `bun run test` before commit.

## Error Handling Policy
- Never throw raw strings or plain objects.
- Use typed errors (`ValidationError`, `NotFoundError`, etc.) for operational failures.
- Unknown errors are mapped by `mapToAppError` to `InternalServerError`.
- All error responses must follow Problem Details fields:
  - `type`, `title`, `status`, `detail`, `instance`, `code`
  - plus correlation: `requestId`, `traceId`

## Logging Policy
- Use structured logs only (`pino` logger).
- Do not introduce `console.log` in app/business logic.
- Exception: console output is allowed in tracing exporter internals (`src/observability/tracing.ts`).
- Include context fields (`requestId`, `traceId`) wherever possible.

## Observability Policy
- HTTP logs are emitted through `pino-http`.
- Request trace context is established in `request-context` middleware and exported to console spans.
- `/metrics` exposes Prometheus-compatible metrics text.
- Metric names and labels should remain low-cardinality; avoid user IDs or raw URLs as labels.

## Testing Policy
- Route behavior: integration tests with Supertest.
- Reusable runtime primitives (error mapping, lifecycle) can use unit-style tests.
- Add tests for:
  - success path,
  - expected operational errors,
  - unknown/internal error path for critical flows.
- Maintain passing checks for lint, typecheck, and tests.

## Security Checklist
- Preserve `helmet`, `cors`, and rate limiting middleware unless deliberately changing policy.
- Do not log secrets (`authorization`, cookies, tokens, passwords, keys).
- Validate all new environment variables in `src/config/env.ts`.
- Avoid leaking internal stack traces to API responses.

## Release / Readiness Checklist
1. `bun install` succeeds on a clean checkout.
2. `bun run lint` passes.
3. `bun run typecheck` passes.
4. `bun run test` passes.
5. `/health`, `/ready`, `/metrics`, `/openapi.json`, `/docs` behave as documented.
6. Graceful shutdown works on `SIGINT`/`SIGTERM`.

## Troubleshooting Playbooks

### App fails at startup
- Check `src/config/env.ts` validation error output.
- Compare `.env` values against `.env.example`.

### Too much or too little logging
- Tune `LOG_LEVEL`.
- Toggle pretty logs with `LOG_PRETTY`.

### Missing request correlation IDs
- Verify middleware order in `src/app.ts` keeps:
  1) `requestIdMiddleware`
  2) `requestContextMiddleware`
  3) `httpLoggerMiddleware`

### `/ready` returning 503
- This indicates shutdown state was entered.
- Inspect signal handling and lifecycle logs in `src/server.ts`.

### Rate limits firing unexpectedly
- Review `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
- Verify request source/IP behavior behind proxies with `TRUST_PROXY`.

## Agent Guardrails
- Prefer non-destructive commands.
- Do not run `git reset --hard` or revert unrelated user changes.
- Do not amend commits unless explicitly requested.
- Keep changes scoped and tested.
