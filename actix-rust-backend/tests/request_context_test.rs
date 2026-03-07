use actix_rust_backend::middleware::request_context::RequestContextMiddleware;
use actix_rust_backend::middleware::request_id::RequestId;
use actix_rust_backend::routes::health;
use actix_web::{http::StatusCode, test, App};

#[actix_web::test]
async fn request_id_is_propagated() {
    let app = test::init_service(
        App::new()
            .wrap(RequestContextMiddleware)
            .wrap(RequestId)
            .service(health::health),
    )
    .await;
    let req = test::TestRequest::get()
        .uri("/health")
        .insert_header(("x-request-id", "abc-123"))
        .to_request();
    let res = test::call_service(&app, req).await;
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(res.headers().get("x-request-id").unwrap(), "abc-123");
    assert!(res.headers().contains_key("x-trace-id"));
}
