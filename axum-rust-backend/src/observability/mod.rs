use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

use crate::config::AppConfig;

pub fn init_logging(config: &AppConfig) {
    let filter = EnvFilter::try_new(&config.log_level).unwrap_or_else(|_| EnvFilter::new("info"));
    let fmt_layer = if config.log_pretty {
        fmt::layer().pretty().boxed()
    } else {
        fmt::layer().json().boxed()
    };

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt_layer)
        .init();
}
