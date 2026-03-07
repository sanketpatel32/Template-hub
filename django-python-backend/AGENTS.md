# AGENTS.md

## Architecture Map
- `project/`: Django runtime config, middleware, OpenAPI schema, and lifecycle/readiness utilities.
- `apps/api/views/`: HTTP endpoint handlers.
- `apps/api/errors/`: typed error definitions and mapping.
- `tests/`: endpoint, lifecycle, and error normalization tests.

## Local Commands
- Install: `python -m pip install -e ".[dev]"`
- Dev server: `python manage.py runserver 0.0.0.0:${PORT:-8000}`
- Start: `python -m gunicorn project.wsgi:application --bind 0.0.0.0:${PORT:-8000}`
- Lint: `python -m ruff check .`
- Format: `python -m ruff format .`
- Typecheck: `python -m mypy .`
- Test: `python -m pytest`

## Workflow Expectations
1. Keep app/API logic in `apps/api/`.
2. Keep cross-cutting concerns in `project/middleware.py`.
3. Validate all new env vars in `project/env.py`.
4. Add tests for any changed route/middleware behavior.

## Error-Handling Policy
- Raise typed `AppError` subclasses for operational failures.
- Unknown errors must pass through `apps/api/errors/error_map.py`.
- API errors must always return RFC7807 problem details.

## Logging Policy
- Use structured logger calls (no raw prints).
- Preserve request correlation fields in logs.
- Redact sensitive data.

## Observability Policy
- Preserve `/metrics`, request timing metrics, and trace log emission.
- Maintain request ID / trace ID propagation behavior.

## Testing Policy
- Use Django test client through `pytest`.
- Keep coverage for health, readiness, metrics, ping, rate limit, and error normalization.

## Release / Readiness Checklist
1. `python -m ruff check .`
2. `python -m ruff format --check .`
3. `python -m mypy .`
4. `python -m pytest`
5. Verify `/docs` and `/openapi.json` routes.

## Guardrails
- Avoid introducing heavy dependencies when native Django works.
- Keep the template self-contained in this folder.
- Do not leak secrets in logs/errors.

See [DETAILS.md](./DETAILS.md) for deep technical context.
