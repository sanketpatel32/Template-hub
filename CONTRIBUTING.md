# Contributing

Thanks for contributing to this templates repository.

## Scope of Contributions

- New backend templates
- Improvements to existing templates
- Documentation fixes and clarity improvements

## Template Baseline Requirements (Mandatory)

Each template added to this repo must be self-contained and include the same baseline capabilities as the current production template.

### 1) Folder and File Baseline

At minimum, a template should include:

- `README.md` (lean setup and run)
- `DETAILS.md` (deep architecture and ops details)
- `AGENTS.md` (agent workflow/policy for that template)
- `package.json` with runnable scripts
- lockfile (for chosen package manager, for Bun use `bun.lock`)
- `tsconfig.json` (if TypeScript template)
- linter/formatter config (for Bun/TS baseline: `biome.json`)
- `.env.example`
- `.gitignore`
- `.editorconfig`
- `.dockerignore`
- `Dockerfile`
- `src/` source directory
- `tests/` directory
- `.husky/` hooks (or equivalent commit gate)

### 2) Runtime and Scripts Baseline

Each template must define and document these scripts (or equivalent names/behavior):

- `dev` (watch mode)
- `start` (normal runtime)
- `typecheck`
- `lint`
- `format`
- `test`
- `test:watch`
- `prepare` (for hook setup where relevant)

### 3) App Architecture Baseline

A template should be layered and easy to extend:

- `config/` for typed config/env loading and validation
- `middleware/` for request pipeline concerns
- `routes/` for HTTP route composition
- `types/` for shared API/app typing
- `errors/` for typed error hierarchy and mapping
- `observability/` for logging/tracing/metrics
- `state/` for runtime readiness/health state

Scaffold these extension folders even if initially empty:

- `controllers/`
- `services/`
- `repositories/`
- `validators/`
- `schemas/`
- `lib/`
- `jobs/`
- `events/`

### 4) API and Endpoint Baseline

Each API template should provide:

- Liveness endpoint (e.g. `/health`)
- Readiness endpoint (e.g. `/ready`)
- One sample versioned API endpoint (e.g. `/api/v1/ping`)
- OpenAPI JSON endpoint (e.g. `/openapi.json`)
- Swagger UI endpoint (e.g. `/docs`)
- Metrics endpoint (e.g. `/metrics`)

### 5) Error Handling Baseline

- Typed application errors (not raw strings/objects)
- Centralized error mapping for unknown failures
- RFC7807-style problem response contract
- Request correlation identifiers in error responses when available

### 6) Security Baseline

- Security headers middleware
- CORS policy middleware
- Compression middleware
- Rate limiting middleware
- Request ID / request context propagation

### 7) Observability Baseline

- Structured logging (production-safe)
- HTTP request logging middleware
- Request correlation fields (`requestId`, `traceId`, and similar context)
- Metrics instrumentation and exposition endpoint
- Basic tracing scaffold or equivalent request timing tracing

### 8) Runtime Hardening Baseline

- Process signal handling (`SIGINT`/`SIGTERM`)
- Graceful shutdown with timeout
- `uncaughtException` and `unhandledRejection` handling
- Readiness state transitions during shutdown

### 9) Testing Baseline

- Integration tests for success endpoints
- Tests for unknown route handling
- Tests for error normalization behavior
- Tests for rate limiting behavior
- Tests for docs/metrics/health/readiness endpoints
- Tests for lifecycle helpers where present

### 10) Quality Gates Baseline

Before opening a PR, templates must pass:

- lint
- typecheck
- tests
- pre-commit checks (hooks + staged file checks)

## Pull Request Workflow

1. Fork the repository and create a focused branch.
2. Keep commits small and logically grouped.
3. Include a PR summary that explains:
   - what changed,
   - why it changed,
   - how you validated it.
4. When adding/removing a template, update the root template catalog in [README.md](./README.md).

## Review Checklist

- Links and file paths resolve correctly.
- Commands are accurate and executable.
- No secrets, tokens, or private credentials are committed.
- Documentation matches actual project behavior.
- Template baseline requirements in this file are fully satisfied.

## Issue Guidance

For bug reports, include:

- template name/path,
- steps to reproduce,
- expected behavior,
- actual behavior,
- relevant logs/errors.

For feature requests, include:

- problem statement,
- proposed approach,
- tradeoffs/constraints.

## Security

Do not report security vulnerabilities in public issues.
Use GitHub Security Advisories for private disclosure to repository maintainers/admins.
