use actix_rust_backend::routes::ping;
use actix_web::{http::StatusCode, test, web, App};

#[actix_web::test]
async fn ping_ok() {
    let app =
        test::init_service(App::new().service(web::scope("/api/v1").service(ping::ping))).await;
    let req = test::TestRequest::get().uri("/api/v1/ping").to_request();
    let res = test::call_service(&app, req).await;
    assert_eq!(res.status(), StatusCode::OK);
}
