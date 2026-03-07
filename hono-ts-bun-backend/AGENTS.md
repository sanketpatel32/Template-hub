# AGENTS.md

## Project Purpose
This repository is a production-focused Hono + TypeScript + Bun backend template.  
It includes standardized error handling (RFC7807-style), structured logging, request tracing, metrics, and graceful shutdown behavior.
For quick project onboarding, see [`README.md`](./README.md).  
For consolidated system/runtime documentation, see [`DETAILS.md`](./DETAILS.md).

## Architecture Map
- `src/app.ts`: Hono app composition and middleware order.
- `src/server.ts`: HTTP server startup, process signal handlers, graceful shutdown wiring.
- `src/server-lifecycle.ts`: Reusable shutdown controller logic.
- `src/config/`: Runtime config and OpenAPI document setup.
- `src/errors/`: Typed application error hierarchy and unknown-error mapping.
- `src/middleware/`: Request ID/context, rate-limit, not-found, and error middleware.
- `src/observability/`: Logger, tracing, and Prometheus metrics support.
- `src/routes/`: Health/readiness/metrics/ping route modules.
- `src/state/readiness.ts`: Process readiness state used by `/ready`.
- `src/controllers/`, `src/services/`, `src/repositories/`: Placeholder app layers for feature implementation.
- `src/validators/`, `src/schemas/`: Validation and schema-specific modules.
- `src/lib/`, `src/jobs/`, `src/events/`: Shared libraries, async/background tasks, and event handlers.
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

## Workflow Expectations
1. Add/update endpoint logic under `src/routes/`.
2. Keep middleware and observability concerns in dedicated modules.
3. Throw typed errors from `src/errors/http-errors.ts` for expected failures.
4. Let `src/middleware/error-handler.ts` normalize all failures to Problem Details.
5. Add/adjust tests in `tests/` for each behavior change.
6. Run lint, typecheck, and tests before commit.

## Error-Handling Policy
- Never throw raw strings or plain objects.
- Use typed errors (`ValidationError`, `NotFoundError`, etc.) for operational failures.
- Unknown errors are mapped by `mapToAppError` to `InternalServerError`.
- Error responses must follow Problem Details fields:
  - `type`, `title`, `status`, `detail`, `instance`, `code`
  - plus correlation: `requestId`, `traceId`

## Logging Policy
- Use structured logs only (`pino`) in app/business logic.
- Include correlation fields when available: `requestId`, `traceId`, `spanId`.
- Do not log secrets or sensitive headers.

## Observability Policy
- Request traces are initialized in middleware and optionally exported as span JSON.
- `/metrics` exposes Prometheus-compatible metrics text.
- Keep metric labels low-cardinality.

## Testing Policy
- Use Hono-native request testing (`app.request`) for route tests.
- Keep lifecycle and error-map tests unit-style.
- Cover success, known-error, and unknown-error paths for critical flows.

## Release / Readiness Checklist
1. `bun install` succeeds.
2. `bun run lint` passes.
3. `bun run typecheck` passes.
4. `bun run test` passes.
5. `/health`, `/ready`, `/metrics`, `/openapi.json`, `/docs` behave as documented.
6. Graceful shutdown flow works for `SIGINT`/`SIGTERM`.

## Guardrails
- Keep changes scoped to this template.
- Avoid destructive git commands.
- Preserve Problem Details compatibility.
- Validate new env vars in `src/config/env.ts`.

## Further Reading
- [`DETAILS.md`](./DETAILS.md)
