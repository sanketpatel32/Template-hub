use std::time::Instant;

use axum::{
    body::Body,
    extract::State,
    http::{HeaderValue, Request, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use tracing::{info, warn};
use uuid::Uuid;

use crate::{errors::AppError, state::AppState};

#[derive(Clone, Debug)]
pub struct RequestContext {
    pub request_id: String,
    pub trace_id: String,
    pub span_id: String,
}

pub async fn request_context(mut req: Request<Body>, next: Next) -> Response {
    let request_id = req
        .headers()
        .get("x-request-id")
        .and_then(|v| v.to_str().ok())
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let trace_id = req
        .headers()
        .get("x-trace-id")
        .and_then(|v| v.to_str().ok())
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| Uuid::new_v4().simple().to_string());

    let span_id = Uuid::new_v4().simple().to_string()[..16].to_string();

    req.extensions_mut().insert(RequestContext {
        request_id: request_id.clone(),
        trace_id: trace_id.clone(),
        span_id: span_id.clone(),
    });

    let mut res = next.run(req).await;
    add_context_headers(&mut res, &request_id, &trace_id, &span_id);
    res
}

fn add_context_headers(res: &mut Response, request_id: &str, trace_id: &str, span_id: &str) {
    if let Ok(value) = HeaderValue::from_str(request_id) {
        res.headers_mut().insert("x-request-id", value);
    }
    if let Ok(value) = HeaderValue::from_str(trace_id) {
        res.headers_mut().insert("x-trace-id", value);
    }
    if let Ok(value) = HeaderValue::from_str(span_id) {
        res.headers_mut().insert("x-span-id", value);
    }
}

pub async fn request_logging(
    State(state): State<AppState>,
    req: Request<Body>,
    next: Next,
) -> Response {
    let start = Instant::now();
    let method = req.method().clone();
    let path = req.uri().path().to_string();
    let context = req.extensions().get::<RequestContext>().cloned();

    let res = next.run(req).await;

    let status = res.status();
    let elapsed = start.elapsed().as_secs_f64();
    state
        .metrics
        .requests_total
        .with_label_values(&[method.as_str(), &path, status.as_str()])
        .inc();
    state
        .metrics
        .request_duration_seconds
        .with_label_values(&[method.as_str(), &path, status.as_str()])
        .observe(elapsed);

    if let Some(ctx) = context {
        info!(
            requestId = %ctx.request_id,
            traceId = %ctx.trace_id,
            spanId = %ctx.span_id,
            method = %method,
            path,
            status = %status,
            durationMs = elapsed * 1000.0,
            "request completed"
        );
        if state.config.trace_enabled {
            info!(traceId = %ctx.trace_id, spanId = %ctx.span_id, "trace-export");
        }
    }

    res
}

pub async fn rate_limit(State(state): State<AppState>, req: Request<Body>, next: Next) -> Response {
    if !state.rate_limiter.allow().await {
        warn!("rate limit exceeded");
        let context = req.extensions().get::<RequestContext>().cloned();
        let err = AppError::rate_limited(req.uri().path().to_string()).with_context(context);
        return err.into_response();
    }
    next.run(req).await
}

pub async fn security_headers(req: Request<Body>, next: Next) -> Response {
    let mut res = next.run(req).await;
    res.headers_mut().insert(
        "x-content-type-options",
        HeaderValue::from_static("nosniff"),
    );
    res.headers_mut()
        .insert("x-frame-options", HeaderValue::from_static("DENY"));
    res
}

pub async fn map_internal_errors(req: Request<Body>, next: Next) -> Response {
    let context = req.extensions().get::<RequestContext>().cloned();
    let path = req.uri().path().to_string();
    let mut res = next.run(req).await;
    if res.status() == StatusCode::INTERNAL_SERVER_ERROR
        && res.extensions().get::<crate::errors::AppError>().is_none()
    {
        let err = AppError::internal("internal server error", path).with_context(context);
        res = err.into_response();
    }
    res
}
