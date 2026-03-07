FROM python:3.12-slim AS deps
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY pyproject.toml README.md ./
RUN pip install --no-cache-dir .

FROM python:3.12-slim AS runner
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

COPY --from=deps /usr/local /usr/local
COPY src ./src

EXPOSE 3000
CMD ["python", "-m", "src.server"]
