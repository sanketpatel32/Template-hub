FROM rust:1.85 as builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
RUN useradd -m appuser
COPY --from=builder /app/target/release/axum-rust-backend /app/axum-rust-backend
USER appuser
EXPOSE 3000
CMD ["/app/axum-rust-backend"]
