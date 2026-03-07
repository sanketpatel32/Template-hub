FROM rust:1.82 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/actix-rust-backend /usr/local/bin/actix-rust-backend
EXPOSE 8080
CMD ["actix-rust-backend"]
