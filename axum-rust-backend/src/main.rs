use std::time::Duration;

use axum_rust_backend::{
    app::build_app, config::AppConfig, observability::init_logging, server_lifecycle::run_server,
};
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = AppConfig::from_env()?;
    init_logging(&config);

    let app = build_app(config.clone());
    let addr = ([0, 0, 0, 0], config.port).into();
    info!(port = config.port, "starting server");

    run_server(app, addr, Duration::from_millis(config.shutdown_timeout_ms)).await?;
    Ok(())
}
