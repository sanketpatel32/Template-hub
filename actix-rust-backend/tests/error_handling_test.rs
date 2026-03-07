use actix_rust_backend::middleware::error_handler::ErrorHandler;
use actix_rust_backend::middleware::not_found;
use actix_rust_backend::middleware::rate_limit::RateLimiter;
use actix_rust_backend::middleware::request_context::RequestContextMiddleware;
use actix_rust_backend::middleware::request_id::RequestId;
use actix_rust_backend::routes::ping;
use actix_web::{http::StatusCode, test, web, App};

#[actix_web::test]
async fn unknown_route_returns_404() {
    let app = test::init_service(
        App::new()
            .wrap(RequestContextMiddleware)
            .wrap(RequestId)
            .default_service(not_found::service()),
    )
    .await;
    let req = test::TestRequest::get().uri("/missing").to_request();
    let res = test::call_service(&app, req).await;
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}

#[actix_web::test]
async fn internal_500_contains_problem_details() {
    let app = test::init_service(
        App::new()
            .wrap(ErrorHandler)
            .wrap(RequestContextMiddleware)
            .wrap(RequestId)
            .service(web::scope("/api/v1").service(ping::ping)),
    )
    .await;

    let req = test::TestRequest::get()
        .uri("/api/v1/ping?fail=true")
        .to_request();
    let res = test::call_service(&app, req).await;
    assert_eq!(res.status(), StatusCode::INTERNAL_SERVER_ERROR);
    let body: serde_json::Value = test::read_body_json(res).await;
    assert!(body.get("traceId").is_some());
}

#[actix_web::test]
async fn rate_limit_429() {
    let app = test::init_service(
        App::new()
            .wrap(RateLimiter::new(1, 60_000))
            .service(web::scope("/api/v1").service(ping::ping)),
    )
    .await;

    let req1 = test::TestRequest::get().uri("/api/v1/ping").to_request();
    let _ = test::call_service(&app, req1).await;
    let req2 = test::TestRequest::get().uri("/api/v1/ping").to_request();
    let res2 = test::call_service(&app, req2).await;
    assert_eq!(res2.status(), StatusCode::TOO_MANY_REQUESTS);
}
