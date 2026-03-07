use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use axum_rust_backend::{app::build_app_with_state, config::AppConfig, state::AppState};
use serde_json::Value;
use tower::ServiceExt;

fn test_state() -> AppState {
    let mut cfg = AppConfig::with_test_defaults();
    cfg.rate_limit_max = 5;
    cfg.rate_limit_window_ms = 60_000;
    AppState::new(cfg)
}

#[tokio::test]
async fn health_works() {
    let app = build_app_with_state(test_state());
    let res = app
        .oneshot(
            Request::get("/health")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn ready_works_and_503_when_not_ready() {
    let state = test_state();
    let app = build_app_with_state(state.clone());

    let ok_res = app
        .clone()
        .oneshot(
            Request::get("/ready")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(ok_res.status(), StatusCode::OK);

    *state.readiness.write().await = false;
    let not_ready = app
        .oneshot(
            Request::get("/ready")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(not_ready.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn ping_works() {
    let app = build_app_with_state(test_state());
    let res = app
        .oneshot(
            Request::get("/api/v1/ping")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn unknown_route_404() {
    let app = build_app_with_state(test_state());
    let res = app
        .oneshot(
            Request::get("/missing")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn internal_500_and_trace_id_in_error() {
    let app = build_app_with_state(test_state());
    let res = app
        .oneshot(
            Request::get("/api/v1/fail")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(res.status(), StatusCode::INTERNAL_SERVER_ERROR);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap_or_else(|e| panic!("to_bytes error: {e}"));
    let json: Value =
        serde_json::from_slice(&body).unwrap_or_else(|e| panic!("json parse error: {e}"));
    assert!(json.get("traceId").is_some());
}

#[tokio::test]
async fn rate_limit_429() {
    let app = build_app_with_state(test_state());
    for _ in 0..5 {
        let _ = app
            .clone()
            .oneshot(
                Request::get("/health")
                    .body(Body::empty())
                    .unwrap_or_else(|e| panic!("request build error: {e}")),
            )
            .await
            .unwrap_or_else(|e| panic!("request run error: {e}"));
    }
    let res = app
        .oneshot(
            Request::get("/health")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(res.status(), StatusCode::TOO_MANY_REQUESTS);
}

#[tokio::test]
async fn metrics_works() {
    let app = build_app_with_state(test_state());
    let res = app
        .oneshot(
            Request::get("/metrics")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn request_id_propagates() {
    let app = build_app_with_state(test_state());
    let req = Request::get("/health")
        .header("x-request-id", "abc-123")
        .body(Body::empty())
        .unwrap_or_else(|e| panic!("request build error: {e}"));
    let res = app
        .oneshot(req)
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(
        res.headers()
            .get("x-request-id")
            .and_then(|v| v.to_str().ok()),
        Some("abc-123")
    );
}

#[tokio::test]
async fn docs_and_openapi_work() {
    let app = build_app_with_state(test_state());
    let openapi = app
        .clone()
        .oneshot(
            Request::get("/openapi.json")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(openapi.status(), StatusCode::OK);

    let docs = app
        .oneshot(
            Request::get("/docs")
                .body(Body::empty())
                .unwrap_or_else(|e| panic!("request build error: {e}")),
        )
        .await
        .unwrap_or_else(|e| panic!("request run error: {e}"));
    assert_eq!(docs.status(), StatusCode::OK);
}
