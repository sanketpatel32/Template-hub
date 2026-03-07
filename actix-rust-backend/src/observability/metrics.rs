use once_cell::sync::Lazy;
use prometheus::{IntCounterVec, Opts, Registry};

pub static REGISTRY: Lazy<Registry> = Lazy::new(Registry::new);
pub static HTTP_REQUESTS: Lazy<IntCounterVec> = Lazy::new(|| {
    IntCounterVec::new(
        Opts::new("http_requests_total", "HTTP requests"),
        &["path", "status"],
    )
    .expect("counter")
});

pub fn init_metrics() {
    let _ = REGISTRY.register(Box::new(HTTP_REQUESTS.clone()));
}
