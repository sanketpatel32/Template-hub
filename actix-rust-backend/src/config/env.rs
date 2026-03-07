use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub port: u16,
    pub app_env: String,
    pub cors_origin: String,
    pub rate_limit_window_ms: u64,
    pub rate_limit_max: u64,
    pub log_level: String,
    pub log_pretty: bool,
    pub trust_proxy: bool,
    pub shutdown_timeout_ms: u64,
    pub metrics_enabled: bool,
    pub trace_enabled: bool,
}

impl AppConfig {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            port: req("PORT")?.parse()?,
            app_env: req("APP_ENV")?,
            cors_origin: req("CORS_ORIGIN")?,
            rate_limit_window_ms: req("RATE_LIMIT_WINDOW_MS")?.parse()?,
            rate_limit_max: req("RATE_LIMIT_MAX")?.parse()?,
            log_level: req("LOG_LEVEL")?,
            log_pretty: req("LOG_PRETTY")?.parse()?,
            trust_proxy: req("TRUST_PROXY")?.parse()?,
            shutdown_timeout_ms: req("SHUTDOWN_TIMEOUT_MS")?.parse()?,
            metrics_enabled: req("METRICS_ENABLED")?.parse()?,
            trace_enabled: req("TRACE_ENABLED")?.parse()?,
        })
    }
}

fn req(key: &str) -> anyhow::Result<String> {
    env::var(key).map_err(|_| anyhow::anyhow!("missing env {key}"))
}
