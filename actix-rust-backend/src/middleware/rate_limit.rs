use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use actix_service::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::Error;
use futures_util::future::{ok, LocalBoxFuture, Ready};
use std::task::{Context, Poll};

use crate::errors::app_error::AppError;

#[derive(Clone)]
pub struct RateLimiter {
    pub max: u64,
    pub window: Duration,
    store: Arc<Mutex<HashMap<String, (u64, Instant)>>>,
}

impl RateLimiter {
    pub fn new(max: u64, window_ms: u64) -> Self {
        Self {
            max,
            window: Duration::from_millis(window_ms),
            store: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RateLimiter
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = RateLimiterMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RateLimiterMiddleware {
            service,
            limiter: self.clone(),
        })
    }
}

pub struct RateLimiterMiddleware<S> {
    service: S,
    limiter: RateLimiter,
}

impl<S, B> Service<ServiceRequest> for RateLimiterMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let key = req
            .connection_info()
            .realip_remote_addr()
            .unwrap_or("unknown")
            .to_string();

        let mut map = self.limiter.store.lock().expect("lock");
        let now = Instant::now();
        let entry = map.entry(key).or_insert((0, now));
        if now.duration_since(entry.1) > self.limiter.window {
            *entry = (0, now);
        }
        entry.0 += 1;
        let limited = entry.0 > self.limiter.max;
        drop(map);

        if limited {
            Box::pin(async { Err(AppError::RateLimited.into()) })
        } else {
            let fut = self.service.call(req);
            Box::pin(async move { fut.await })
        }
    }
}
