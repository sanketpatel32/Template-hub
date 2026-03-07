use axum::{
    http::{HeaderValue, Method, Request},
    middleware,
    response::IntoResponse,
    routing::get,
    Router,
};
use tower::ServiceBuilder;
use tower_http::{compression::CompressionLayer, cors::CorsLayer};

use crate::{
    config::AppConfig,
    errors::AppError,
    middleware::{
        map_internal_errors, rate_limit, request_context, request_logging, security_headers,
        RequestContext,
    },
    routes,
    state::AppState,
};

pub fn build_app(config: AppConfig) -> Router {
    let state = AppState::new(config.clone());
    build_app_with_state(state)
}

pub fn build_app_with_state(state: AppState) -> Router {
    let config = state.config.clone();
    let cors = if config.cors_origin == "*" {
        CorsLayer::new().allow_origin(tower_http::cors::Any)
    } else if let Ok(origin) = HeaderValue::from_str(&config.cors_origin) {
        CorsLayer::new().allow_origin(origin)
    } else {
        CorsLayer::new().allow_origin(tower_http::cors::Any)
    }
    .allow_methods([
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::DELETE,
        Method::OPTIONS,
    ])
    .allow_headers(tower_http::cors::Any);

    Router::new()
        .merge(routes::router())
        .route("/", get(|| async { "axum-rust-backend" }))
        .fallback(not_found)
        .layer(
            ServiceBuilder::new()
                .layer(middleware::from_fn_with_state(
                    state.clone(),
                    map_internal_errors,
                ))
                .layer(middleware::from_fn_with_state(state.clone(), rate_limit))
                .layer(middleware::from_fn_with_state(
                    state.clone(),
                    request_logging,
                ))
                .layer(CompressionLayer::new())
                .layer(cors)
                .layer(middleware::from_fn(security_headers))
                .layer(middleware::from_fn(request_context)),
        )
        .with_state(state)
}

async fn not_found(req: Request<axum::body::Body>) -> impl IntoResponse {
    let context = req.extensions().get::<RequestContext>().cloned();
    AppError::not_found(req.uri().path().to_string()).with_context(context)
}
