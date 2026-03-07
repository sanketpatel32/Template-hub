# Agent guidance for actix-rust-backend

- Keep handlers thin and typed.
- Use `AppError` + Problem Details for all API errors.
- Preserve middleware ordering documented in `src/app.rs`.
- Ensure additions include tests in `tests/`.
- Keep `README.md` concise and move deep explanations to `DETAILS.md`.
