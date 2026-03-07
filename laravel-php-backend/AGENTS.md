# AGENTS: laravel-php-backend

## Architecture map
- `public/index.php`: request pipeline, routing, error normalization.
- `app/Http/Controllers`: HTTP handlers (`health`, `ready`, `metrics`, `ping`).
- `app/Http/Middleware`: request IDs/context, rate limit, centralized error handling.
- `app/Errors`: typed error hierarchy and error mapping.
- `app/Observability`: logger, metrics, tracing.
- `app/State`: readiness state.

## Local commands
- `composer dev`
- `composer start`
- `composer test`
- `composer lint`
- `composer format`
- `composer analyze`

## Workflow expectations
- Keep RFC7807 problem details as the only error contract.
- Preserve correlation IDs in responses/logs/errors.
- Add endpoint tests and docs updates with behavior changes.

## Error-handling policy
- Throw typed `AppError` subclasses where possible.
- Normalize unknown exceptions with `ErrorMap`.
- No ad-hoc error payloads.

## Logging policy
- Structured logs only.
- Redact sensitive fields.
- Include request/trace/span IDs.

## Observability policy
- `/metrics` must stay Prometheus-compatible.
- Tracing output remains JSON span records.
- Readiness endpoint must reflect runtime state.

## Testing policy
- Cover endpoint contracts, error mapping, readiness transitions, and correlation behavior.

## Release/readiness checklist
- Run lint/test/analyze.
- Verify `/health`, `/ready`, `/metrics`, `/api/v1/ping`, `/openapi.json`, `/docs`.
- Verify Docker image builds.

## Guardrails
- No auth/domain logic in template bootstrap.
- Keep docs lean in `README`; deep notes in `DETAILS`.

See [DETAILS.md](./DETAILS.md).
