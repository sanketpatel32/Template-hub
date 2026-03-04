# AGENTS.md

## Project Purpose
This repository is a production-focused FastAPI + Python backend template.  
It includes standardized error handling (RFC7807-style), structured logging, request tracing, metrics, and graceful shutdown behavior.
For quick project onboarding, see [`README.md`](./README.md).  
For consolidated system/runtime documentation, see [`DETAILS.md`](./DETAILS.md).

## Architecture Map
- `src/app.py`: FastAPI app composition and middleware order.
- `src/server.py`: Uvicorn startup entrypoint and runtime signal hooks.
- `src/server_lifecycle.py`: Reusable async shutdown controller logic.
- `src/config/`: Runtime config and OpenAPI metadata setup.
- `src/errors/`: Typed application error hierarchy and unknown-error mapping.
- `src/middleware/`: Request ID/context, rate-limit, and centralized exception handling.
- `src/observability/`: Logger, HTTP logging, tracing scaffold, and Prometheus metrics support.
- `src/routes/`: Health/readiness/metrics/ping route modules.
- `src/state/readiness.py`: Process readiness state used by `/ready`.
- `src/controllers/`, `src/services/`, `src/repositories/`: Placeholder app layers for feature implementation.
- `src/validators/`, `src/schemas/`: Validation and schema-specific modules.
- `src/lib/`, `src/jobs/`, `src/events/`: Shared libraries, async/background tasks, and event-driven handlers.
- `tests/`: Integration and unit-style tests.

## Local Commands
- Create venv: `python -m venv .venv`
- Install dependencies: `python -m pip install -e ".[dev]"`
- Dev server: `uvicorn src.server:app --reload`
- Start server: `python -m src.server`
- Typecheck: `mypy src tests`
- Lint: `ruff check .`
- Format: `ruff format .`
- Tests: `pytest`

## Development Workflow
1. Add or update route logic under `src/routes/`.
2. Add middleware or service changes in dedicated modules; avoid bloating `app.py`.
3. Raise typed errors from `src/errors/http_errors.py` for expected failures.
4. Let `src/middleware/error_handler.py` normalize failures to Problem Details.
5. Add/adjust tests in `tests/` for every behavior change.
6. Run `ruff check .`, `mypy src tests`, and `pytest` before commit.

## Error Handling Policy
- Never raise raw strings or plain objects.
- Use typed errors (`ValidationError`, `NotFoundError`, etc.) for operational failures.
- Unknown errors are mapped by `map_to_app_error` to `InternalServerError`.
- All error responses must follow Problem Details fields:
  - `type`, `title`, `status`, `detail`, `instance`, `code`
  - plus correlation: `requestId`, `traceId`

## Logging Policy
- Use structured logs only (`logging` + JSON formatter in production).
- Do not introduce bare `print` calls in app/business logic.
- Include context fields (`request_id`, `trace_id`) wherever possible.

## Observability Policy
- HTTP logs are emitted through custom middleware.
- Request trace context is established in request-context middleware and exported as span logs.
- `/metrics` exposes Prometheus-compatible metrics text.
- Metric names and labels should remain low-cardinality; avoid user IDs or raw URLs as labels.

## Testing Policy
- Route behavior: integration tests with FastAPI `TestClient`.
- Reusable runtime primitives (error mapping, lifecycle) can use unit-style tests.
- Add tests for:
  - success path,
  - expected operational errors,
  - unknown/internal error path for critical flows.
- Maintain passing checks for lint, typecheck, and tests.

## Security Checklist
- Preserve CORS, compression, and rate limiting middleware unless deliberately changing policy.
- Do not log secrets (`authorization`, cookies, tokens, passwords, keys).
- Validate all new environment variables in `src/config/env.py`.
- Avoid leaking internal stack traces to API responses.

## Release / Readiness Checklist
1. `python -m pip install -e ".[dev]"` succeeds on a clean checkout.
2. `ruff check .` passes.
3. `mypy src tests` passes.
4. `pytest` passes.
5. `/health`, `/ready`, `/metrics`, `/openapi.json`, `/docs` behave as documented.
6. Graceful shutdown hooks work as expected.

## Troubleshooting Playbooks

### App fails at startup
- Check `src/config/env.py` validation error output.
- Compare `.env` values against `.env.example`.

### Too much or too little logging
- Tune `LOG_LEVEL`.
- Toggle pretty logs with `LOG_PRETTY`.

### Missing request correlation IDs
- Verify middleware order in `src/app.py` keeps:
  1) `RequestIdMiddleware`
  2) `RequestContextMiddleware`
  3) `HttpLoggerMiddleware`

### `/ready` returning 503
- This indicates shutdown state was entered.
- Inspect readiness transitions and lifecycle logs.

### Rate limits firing unexpectedly
- Review `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`.
- Verify request source/IP behavior behind proxies with `TRUST_PROXY`.

## Agent Guardrails
- Prefer non-destructive commands.
- Do not run `git reset --hard` or revert unrelated user changes.
- Do not amend commits unless explicitly requested.
- Keep changes scoped and tested.
