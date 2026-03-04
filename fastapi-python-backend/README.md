# FastAPI Python Backend Template

Production-grade FastAPI API starter with Python.

## Quick Start
```bash
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install -e ".[dev]"
copy .env.example .env
uvicorn src.server:app --reload
```

Server default URL: `http://localhost:3000`

## Core Commands
- `uvicorn src.server:app --reload`
- `python -m src.server`
- `mypy src tests`
- `ruff check .`
- `pytest`

## Core Endpoints
- `GET /health`
- `GET /ready`
- `GET /metrics`
- `GET /api/v1/ping`
- `GET /openapi.json`
- `GET /docs`

## More Details
- Technical details: [DETAILS.md](./DETAILS.md)
- Agent workflow/policy: [AGENTS.md](./AGENTS.md)
