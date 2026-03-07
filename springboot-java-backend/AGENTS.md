# AGENTS.md

## Purpose
This template provides a production-grade Spring Boot backend baseline. Keep edits focused, typed, and test-backed.

## Agent workflow
1. Read [README.md](./README.md) for quick commands.
2. Read [DETAILS.md](./DETAILS.md) for architecture and runtime behavior.
3. Keep middleware order and RFC7807 contract stable unless explicitly changing policy.
4. Add tests for every endpoint or runtime behavior change.

## Guardrails
- Prefer typed config in `config/EnvConfig` over ad-hoc env parsing.
- Raise typed `AppError` subclasses for operational failures.
- Avoid printing secrets; keep correlation fields in logs.
- Run `./gradlew spotlessCheck test` before finishing.
