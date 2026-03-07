# Flask Python Backend Template

Production-grade Flask API starter with typed configuration, observability, and RFC7807 errors.

## Quick Start
```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
cp .env.example .env
python -m src.server
```

Server default URL: `http://localhost:3000`

## Core Commands
- Dev: `python -m src.server`
- Start: `python -m src.server`
- Lint: `ruff check .`
- Format: `ruff format .`
- Typecheck: `mypy src tests`
- Test: `pytest`

## Core Endpoints
- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

## More Details
- Technical guide: [DETAILS.md](./DETAILS.md)
- Agent instructions: [AGENTS.md](./AGENTS.md)
