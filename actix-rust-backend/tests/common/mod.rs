use actix_cors::Cors;
use actix_web::http::header;
use actix_web::middleware::{Compress, DefaultHeaders, Logger};
use actix_web::{web, App};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use actix_rust_backend::config::swagger::ApiDoc;
use actix_rust_backend::middleware::error_handler::ErrorHandler;
use actix_rust_backend::middleware::not_found;
use actix_rust_backend::middleware::rate_limit::RateLimiter;
use actix_rust_backend::middleware::request_context::RequestContextMiddleware;
use actix_rust_backend::middleware::request_id::RequestId;
use actix_rust_backend::routes::{health, metrics, ping};
use actix_rust_backend::state::readiness::ReadinessState;

pub fn app(readiness: ReadinessState, metrics_enabled: bool, rate_limit_max: u64) -> App<impl actix_service::ServiceFactory<
    actix_web::dev::ServiceRequest,
    Config = (),
    Response = actix_web::dev::ServiceResponse<impl actix_web::body::MessageBody>,
    Error = actix_web::Error,
    InitError = (),
>> {
    let openapi = ApiDoc::openapi();
    let cors = Cors::default()
        .allowed_origin("http://localhost:3000")
        .allowed_methods(vec!["GET", "POST", "OPTIONS"])
        .allowed_headers(vec![header::CONTENT_TYPE, header::AUTHORIZATION]);

    App::new()
        .app_data(web::Data::new(readiness))
        .app_data(web::Data::new(metrics_enabled))
        .wrap(ErrorHandler)
        .wrap(RateLimiter::new(rate_limit_max, 60_000))
        .wrap(Logger::default())
        .wrap(Compress::default())
        .wrap(cors)
        .wrap(
            DefaultHeaders::new()
                .add(("x-content-type-options", "nosniff"))
                .add(("x-frame-options", "DENY")),
        )
        .wrap(RequestContextMiddleware)
        .wrap(RequestId)
        .service(health::health)
        .service(health::ready)
        .service(metrics::metrics)
        .service(web::scope("/api/v1").service(ping::ping))
        .service(web::resource("/openapi.json").route(web::get().to(move || async move { web::Json(openapi.clone()) })))
        .service(SwaggerUi::new("/docs/{_:.*}").url("/openapi.json", ApiDoc::openapi()))
        .default_service(not_found::service())
}
