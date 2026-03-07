use std::time::Instant;

use actix_rust_backend::server_lifecycle::shutdown_with_timeout;

#[actix_web::test]
async fn shutdown_helper_respects_timeout_path() {
    let start = Instant::now();
    shutdown_with_timeout(5).await;
    assert!(start.elapsed().as_millis() <= 100);
}
