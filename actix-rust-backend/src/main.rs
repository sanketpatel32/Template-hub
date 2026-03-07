use actix_rust_backend::app::build_server;
use actix_rust_backend::config::env::AppConfig;
use actix_rust_backend::observability::logger::init_logging;
use actix_rust_backend::server_lifecycle::run_with_shutdown;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    let config = AppConfig::from_env().expect("valid environment");
    init_logging(&config);
    run_with_shutdown(build_server(config).await?).await
}
