use actix_rust_backend::routes::health;
use actix_rust_backend::state::readiness::ReadinessState;
use actix_web::{http::StatusCode, test, App};

#[actix_web::test]
async fn health_ok() {
    let app = test::init_service(App::new().service(health::health)).await;
    let req = test::TestRequest::get().uri("/health").to_request();
    let res = test::call_service(&app, req).await;
    assert_eq!(res.status(), StatusCode::OK);
}

#[actix_web::test]
async fn ready_unavailable_returns_503() {
    let readiness = ReadinessState::new();
    readiness.set_ready(false);
    let app = test::init_service(
        App::new()
            .app_data(actix_web::web::Data::new(readiness))
            .service(health::ready),
    )
    .await;
    let req = test::TestRequest::get().uri("/ready").to_request();
    let res = test::call_service(&app, req).await;
    assert_eq!(res.status(), StatusCode::SERVICE_UNAVAILABLE);
}
