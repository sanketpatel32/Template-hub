use axum::{extract::State, http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::{
    errors::AppError,
    middleware::RequestContext,
    state::AppState,
    types::{ApiResponse, HealthData, PingData, ProblemDetails, ReadyData},
};

#[derive(OpenApi)]
#[openapi(
    paths(health, ready, ping, metrics, fail),
    components(schemas(ApiResponse<HealthData>, ApiResponse<ReadyData>, ApiResponse<PingData>, ProblemDetails))
)]
pub struct ApiDoc;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health))
        .route("/ready", get(ready))
        .route("/metrics", get(metrics))
        .route("/api/v1/ping", get(ping))
        .route("/api/v1/fail", get(fail))
        .route("/openapi.json", get(openapi))
        .merge(SwaggerUi::new("/docs").url("/openapi.json", ApiDoc::openapi()))
}

#[utoipa::path(get, path = "/health", responses((status = 200, body = ApiResponse<HealthData>)))]
async fn health() -> Json<ApiResponse<HealthData>> {
    Json(ApiResponse::ok(HealthData { status: "ok" }))
}

#[utoipa::path(
    get,
    path = "/ready",
    responses((status = 200, body = ApiResponse<ReadyData>), (status = 503, body = ProblemDetails))
)]
async fn ready(
    State(state): State<AppState>,
    context: RequestContext,
) -> Result<Json<ApiResponse<ReadyData>>, AppError> {
    let ready = *state.readiness.read().await;
    if !ready {
        return Err(AppError::service_unavailable("/ready".to_string()).with_context(Some(context)));
    }
    Ok(Json(ApiResponse::ok(ReadyData { ready })))
}

#[utoipa::path(get, path = "/metrics", responses((status = 200, body = String)))]
async fn metrics(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    if !state.config.metrics_enabled {
        return Err(AppError::not_found("/metrics".to_string()));
    }
    let body = state
        .metrics
        .encode()
        .map_err(|_| AppError::internal("failed to encode metrics", "/metrics".to_string()))?;
    Ok((StatusCode::OK, body))
}

#[utoipa::path(get, path = "/api/v1/ping", responses((status = 200, body = ApiResponse<PingData>)))]
async fn ping() -> Json<ApiResponse<PingData>> {
    Json(ApiResponse::ok(PingData { message: "pong" }))
}

#[utoipa::path(get, path = "/api/v1/fail", responses((status = 500, body = ProblemDetails)))]
async fn fail(context: RequestContext) -> Result<Json<ApiResponse<PingData>>, AppError> {
    Err(
        AppError::internal("simulated failure", "/api/v1/fail".to_string())
            .with_context(Some(context)),
    )
}

async fn openapi() -> Json<utoipa::openapi::OpenApi> {
    Json(ApiDoc::openapi())
}
