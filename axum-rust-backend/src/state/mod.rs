use std::{
    sync::Arc,
    time::{Duration, Instant},
};

use prometheus::{Encoder, HistogramOpts, HistogramVec, IntCounterVec, Registry, TextEncoder};
use tokio::sync::RwLock;

use crate::config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub readiness: Arc<RwLock<bool>>,
    pub metrics: Arc<Metrics>,
    pub rate_limiter: Arc<RateLimiter>,
}

impl AppState {
    pub fn new(config: AppConfig) -> Self {
        Self {
            readiness: Arc::new(RwLock::new(true)),
            metrics: Arc::new(Metrics::new()),
            rate_limiter: Arc::new(RateLimiter::new(
                Duration::from_millis(config.rate_limit_window_ms),
                config.rate_limit_max,
            )),
            config,
        }
    }
}

pub struct Metrics {
    pub registry: Registry,
    pub requests_total: IntCounterVec,
    pub request_duration_seconds: HistogramVec,
}

impl Metrics {
    pub fn new() -> Self {
        let registry = Registry::new();
        let requests_total = IntCounterVec::new(
            prometheus::Opts::new("http_requests_total", "HTTP requests total"),
            &["method", "path", "status"],
        )
        .unwrap_or_else(|e| panic!("failed to build requests_total metric: {e}"));
        let request_duration_seconds = HistogramVec::new(
            HistogramOpts::new("http_request_duration_seconds", "HTTP request duration"),
            &["method", "path", "status"],
        )
        .unwrap_or_else(|e| panic!("failed to build request_duration metric: {e}"));

        registry
            .register(Box::new(requests_total.clone()))
            .unwrap_or_else(|e| panic!("failed to register requests_total metric: {e}"));
        registry
            .register(Box::new(request_duration_seconds.clone()))
            .unwrap_or_else(|e| panic!("failed to register request_duration metric: {e}"));

        Self {
            registry,
            requests_total,
            request_duration_seconds,
        }
    }

    pub fn encode(&self) -> Result<String, String> {
        let encoder = TextEncoder::new();
        let families = self.registry.gather();
        let mut buf = Vec::new();
        encoder
            .encode(&families, &mut buf)
            .map_err(|err| err.to_string())?;
        String::from_utf8(buf).map_err(|err| err.to_string())
    }
}

pub struct RateLimiter {
    window: Duration,
    max: u64,
    inner: RwLock<RateWindow>,
}

struct RateWindow {
    started: Instant,
    count: u64,
}

impl RateLimiter {
    pub fn new(window: Duration, max: u64) -> Self {
        Self {
            window,
            max,
            inner: RwLock::new(RateWindow {
                started: Instant::now(),
                count: 0,
            }),
        }
    }

    pub async fn allow(&self) -> bool {
        let mut window = self.inner.write().await;
        if window.started.elapsed() >= self.window {
            window.started = Instant::now();
            window.count = 0;
        }

        if window.count >= self.max {
            return false;
        }

        window.count += 1;
        true
    }
}
