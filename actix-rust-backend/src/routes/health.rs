use actix_web::{get, web, HttpMessage, HttpResponse};
use serde::Serialize;
use utoipa::ToSchema;

use crate::errors::app_error::AppError;
use crate::state::readiness::ReadinessState;
use crate::types::api::ApiResponse;
use crate::types::context::RequestContext;

#[derive(Debug, Serialize, ToSchema)]
pub struct HealthResponse {
    pub status: String,
}

#[utoipa::path(get, path = "/health", responses((status = 200, body = ApiResponse<HealthResponse>)))]
#[get("/health")]
pub async fn health() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::ok(HealthResponse {
        status: "ok".into(),
    }))
}

#[utoipa::path(get, path = "/ready", responses((status = 200, body = ApiResponse<HealthResponse>), (status = 503, body = crate::errors::http_errors::ProblemDetails)))]
#[get("/ready")]
pub async fn ready(
    readiness: web::Data<ReadinessState>,
    req: actix_web::HttpRequest,
) -> Result<HttpResponse, AppError> {
    if readiness.is_ready() {
        Ok(HttpResponse::Ok().json(ApiResponse::ok(HealthResponse {
            status: "ready".into(),
        })))
    } else {
        let trace = req
            .extensions()
            .get::<RequestContext>()
            .map(|c| c.trace_id.clone())
            .unwrap_or_else(|| "unknown".into());
        Ok(HttpResponse::ServiceUnavailable()
            .json(AppError::ServiceUnavailable.problem(trace, req.path().into())))
    }
}
