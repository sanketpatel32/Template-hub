# django-python-backend

Production-grade Django API template with typed config, RFC7807 errors, logging, tracing, metrics, and Docker baseline.

## Quick Start
1. `python -m venv .venv && source .venv/bin/activate`
2. `python -m pip install -e ".[dev]"`
3. `cp .env.example .env`
4. `python manage.py runserver 0.0.0.0:${PORT:-8000}`

## Core Commands
- Dev server: `python manage.py runserver 0.0.0.0:${PORT:-8000}`
- Start (prod-style): `python -m gunicorn project.wsgi:application --bind 0.0.0.0:${PORT:-8000}`
- Lint: `python -m ruff check .`
- Format: `python -m ruff format .`
- Typecheck: `python -m mypy .`
- Test: `python -m pytest`

## Core Endpoints
- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

More details: [DETAILS.md](./DETAILS.md)  
Agent workflow: [AGENTS.md](./AGENTS.md)
