use actix_web::{http::StatusCode, test, web, App};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use actix_rust_backend::config::swagger::ApiDoc;
use actix_rust_backend::observability::metrics::init_metrics;
use actix_rust_backend::routes::metrics;

#[actix_web::test]
async fn metrics_ok() {
    init_metrics();
    let app = test::init_service(
        App::new()
            .app_data(web::Data::new(true))
            .service(metrics::metrics),
    )
    .await;
    let req = test::TestRequest::get().uri("/metrics").to_request();
    let res = test::call_service(&app, req).await;
    assert_eq!(res.status(), StatusCode::OK);
}

#[actix_web::test]
async fn openapi_and_docs_reachable() {
    let openapi = ApiDoc::openapi();
    let app = test::init_service(
        App::new()
            .service(
                web::resource("/openapi.json")
                    .route(web::get().to(move || async move { web::Json(openapi.clone()) })),
            )
            .service(SwaggerUi::new("/docs/{_:.*}").url("/openapi.json", ApiDoc::openapi())),
    )
    .await;

    let openapi_req = test::TestRequest::get().uri("/openapi.json").to_request();
    let openapi_res = test::call_service(&app, openapi_req).await;
    assert_eq!(openapi_res.status(), StatusCode::OK);

    let docs_req = test::TestRequest::get().uri("/docs").to_request();
    let docs_res = test::call_service(&app, docs_req).await;
    assert!(docs_res.status().is_success() || docs_res.status().is_redirection());
}
