use actix_web::{get, HttpRequest, HttpResponse};
use serde::Serialize;
use utoipa::ToSchema;

use crate::errors::app_error::AppError;
use crate::types::api::ApiResponse;

#[derive(Debug, Serialize, ToSchema)]
pub struct PingResponse {
    pub message: String,
}

#[utoipa::path(get, path = "/api/v1/ping", responses((status = 200, body = ApiResponse<PingResponse>), (status = 500, body = crate::errors::http_errors::ProblemDetails)))]
#[get("/ping")]
pub async fn ping(req: HttpRequest) -> Result<HttpResponse, AppError> {
    if req.query_string().contains("fail=true") {
        return Err(AppError::Internal);
    }
    Ok(HttpResponse::Ok().json(ApiResponse::ok(PingResponse {
        message: "pong".into(),
    })))
}
