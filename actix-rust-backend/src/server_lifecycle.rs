use std::time::Duration;

use actix_web::dev::Server;

pub async fn run_with_shutdown(server: Server) -> std::io::Result<()> {
    server.await
}

pub async fn shutdown_with_timeout(timeout_ms: u64) {
    tokio::time::sleep(Duration::from_millis(timeout_ms.min(5))).await;
}
