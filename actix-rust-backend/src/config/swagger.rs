use utoipa::OpenApi;

use crate::errors::http_errors::ProblemDetails;
use crate::routes::{health::HealthResponse, ping::PingResponse};

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::routes::health::health,
        crate::routes::health::ready,
        crate::routes::ping::ping,
        crate::routes::metrics::metrics
    ),
    components(schemas(HealthResponse, PingResponse, ProblemDetails)),
    tags((name = "api", description = "Actix Rust backend template API"))
)]
pub struct ApiDoc;
