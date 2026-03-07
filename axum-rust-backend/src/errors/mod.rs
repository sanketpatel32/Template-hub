use axum::{
    extract::FromRequestParts,
    http::{request::Parts, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use thiserror::Error;

use crate::{middleware::RequestContext, types::ProblemDetails};

#[derive(Debug, Error, Clone)]
pub enum AppErrorKind {
    #[error("not found")]
    NotFound,
    #[error("rate limit exceeded")]
    RateLimited,
    #[error("internal server error")]
    Internal,
    #[error("service unavailable")]
    ServiceUnavailable,
}

#[derive(Debug, Clone)]
pub struct AppError {
    kind: AppErrorKind,
    detail: String,
    instance: String,
    context: Option<RequestContext>,
}

impl AppError {
    pub fn not_found(instance: String) -> Self {
        Self {
            kind: AppErrorKind::NotFound,
            detail: "Route not found".to_string(),
            instance,
            context: None,
        }
    }

    pub fn internal(detail: impl Into<String>, instance: String) -> Self {
        Self {
            kind: AppErrorKind::Internal,
            detail: detail.into(),
            instance,
            context: None,
        }
    }

    pub fn rate_limited(instance: String) -> Self {
        Self {
            kind: AppErrorKind::RateLimited,
            detail: "Too many requests".to_string(),
            instance,
            context: None,
        }
    }

    pub fn service_unavailable(instance: String) -> Self {
        Self {
            kind: AppErrorKind::ServiceUnavailable,
            detail: "Service not ready".to_string(),
            instance,
            context: None,
        }
    }

    pub fn with_context(mut self, context: Option<RequestContext>) -> Self {
        self.context = context;
        self
    }

    fn status(&self) -> StatusCode {
        match self.kind {
            AppErrorKind::NotFound => StatusCode::NOT_FOUND,
            AppErrorKind::RateLimited => StatusCode::TOO_MANY_REQUESTS,
            AppErrorKind::Internal => StatusCode::INTERNAL_SERVER_ERROR,
            AppErrorKind::ServiceUnavailable => StatusCode::SERVICE_UNAVAILABLE,
        }
    }

    fn title(&self) -> &'static str {
        match self.kind {
            AppErrorKind::NotFound => "Not Found",
            AppErrorKind::RateLimited => "Too Many Requests",
            AppErrorKind::Internal => "Internal Server Error",
            AppErrorKind::ServiceUnavailable => "Service Unavailable",
        }
    }

    fn problem_type(&self) -> &'static str {
        match self.kind {
            AppErrorKind::NotFound => "https://example.com/problems/not-found",
            AppErrorKind::RateLimited => "https://example.com/problems/rate-limit",
            AppErrorKind::Internal => "https://example.com/problems/internal-server-error",
            AppErrorKind::ServiceUnavailable => "https://example.com/problems/service-unavailable",
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status();
        let (request_id, trace_id, span_id) = self
            .context
            .map(|ctx| (ctx.request_id, ctx.trace_id, ctx.span_id))
            .unwrap_or_else(|| {
                (
                    "unknown".to_string(),
                    "unknown".to_string(),
                    "unknown".to_string(),
                )
            });

        let body = ProblemDetails {
            r#type: self.problem_type().to_string(),
            title: self.title().to_string(),
            status: status.as_u16(),
            detail: self.detail,
            instance: self.instance,
            request_id: request_id.clone(),
            trace_id: trace_id.clone(),
            span_id: span_id.clone(),
            timestamp: Utc::now(),
        };

        let mut response = (status, Json(body)).into_response();
        response.extensions_mut().insert(self);
        if let Ok(value) = HeaderValue::from_str(&request_id) {
            response.headers_mut().insert("x-request-id", value);
        }
        if let Ok(value) = HeaderValue::from_str(&trace_id) {
            response.headers_mut().insert("x-trace-id", value);
        }
        if let Ok(value) = HeaderValue::from_str(&span_id) {
            response.headers_mut().insert("x-span-id", value);
        }
        response
    }
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for RequestContext
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<RequestContext>()
            .cloned()
            .ok_or_else(|| {
                AppError::internal("request context missing", parts.uri.path().to_string())
            })
    }
}
