FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml README.md ./
COPY project ./project
COPY apps ./apps
COPY manage.py ./manage.py

RUN python -m pip install --upgrade pip && \
    python -m pip install .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
