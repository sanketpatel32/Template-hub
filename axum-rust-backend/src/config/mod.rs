use std::{env, num::ParseIntError, str::FromStr};

use thiserror::Error;

#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum AppEnv {
    Development,
    Staging,
    Production,
}

impl FromStr for AppEnv {
    type Err = ConfigError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.to_ascii_lowercase().as_str() {
            "development" => Ok(Self::Development),
            "staging" => Ok(Self::Staging),
            "production" => Ok(Self::Production),
            _ => Err(ConfigError::InvalidEnv(value.to_string())),
        }
    }
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub port: u16,
    pub app_env: AppEnv,
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
    pub fn from_env() -> Result<Self, ConfigError> {
        Ok(Self {
            port: parse_env("PORT")?,
            app_env: parse_env::<String>("APP_ENV")?.parse()?,
            cors_origin: parse_env("CORS_ORIGIN")?,
            rate_limit_window_ms: parse_env("RATE_LIMIT_WINDOW_MS")?,
            rate_limit_max: parse_env("RATE_LIMIT_MAX")?,
            log_level: parse_env("LOG_LEVEL")?,
            log_pretty: parse_env("LOG_PRETTY")?,
            trust_proxy: parse_env("TRUST_PROXY")?,
            shutdown_timeout_ms: parse_env("SHUTDOWN_TIMEOUT_MS")?,
            metrics_enabled: parse_env("METRICS_ENABLED")?,
            trace_enabled: parse_env("TRACE_ENABLED")?,
        })
    }

    pub fn with_test_defaults() -> Self {
        Self {
            port: 3000,
            app_env: AppEnv::Development,
            cors_origin: "*".to_string(),
            rate_limit_window_ms: 1_000,
            rate_limit_max: 100,
            log_level: "info".to_string(),
            log_pretty: true,
            trust_proxy: false,
            shutdown_timeout_ms: 1_000,
            metrics_enabled: true,
            trace_enabled: true,
        }
    }
}

fn parse_env<T>(key: &'static str) -> Result<T, ConfigError>
where
    T: FromStr,
    ConfigError: From<<T as FromStr>::Err>,
{
    let raw = env::var(key).map_err(|_| ConfigError::MissingEnv(key))?;
    raw.parse::<T>().map_err(Into::into)
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("missing required env var: {0}")]
    MissingEnv(&'static str),
    #[error("invalid APP_ENV value: {0}")]
    InvalidEnv(String),
    #[error("invalid integer: {0}")]
    InvalidInt(#[from] ParseIntError),
    #[error("invalid bool: {0}")]
    InvalidBool(String),
}

impl From<std::str::ParseBoolError> for ConfigError {
    fn from(_: std::str::ParseBoolError) -> Self {
        Self::InvalidBool("expected true/false".to_string())
    }
}
