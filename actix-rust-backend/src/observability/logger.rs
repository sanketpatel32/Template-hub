use tracing_subscriber::{fmt, EnvFilter};

use crate::config::env::AppConfig;

pub fn init_logging(config: &AppConfig) {
    let filter =
        EnvFilter::try_new(config.log_level.clone()).unwrap_or_else(|_| EnvFilter::new("info"));
    if config.log_pretty {
        fmt()
            .with_env_filter(filter)
            .with_target(false)
            .pretty()
            .init();
    } else {
        fmt()
            .with_env_filter(filter)
            .with_target(false)
            .json()
            .init();
    }
}
