use actix_cors::Cors;
use actix_web::dev::Server;
use actix_web::http::header;
use actix_web::middleware::{Compress, DefaultHeaders, Logger};
use actix_web::{web, App, HttpServer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::config::env::AppConfig;
use crate::config::swagger::ApiDoc;
use crate::middleware::error_handler::ErrorHandler;
use crate::middleware::not_found;
use crate::middleware::rate_limit::RateLimiter;
use crate::middleware::request_context::RequestContextMiddleware;
use crate::middleware::request_id::RequestId;
use crate::observability::metrics::init_metrics;
use crate::routes::{health, metrics, ping};
use crate::state::readiness::ReadinessState;

pub async fn build_server(config: AppConfig) -> std::io::Result<Server> {
    init_metrics();
    let readiness = ReadinessState::new();
    let ready_data = web::Data::new(readiness);
    let metrics_enabled = web::Data::new(config.metrics_enabled);
    let openapi = ApiDoc::openapi();

    let server = HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin(&config.cors_origin)
            .allowed_methods(vec!["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
            .allowed_headers(vec![header::CONTENT_TYPE, header::AUTHORIZATION])
            .max_age(3600);

        App::new()
            .app_data(ready_data.clone())
            .app_data(metrics_enabled.clone())
            .wrap(ErrorHandler)
            .wrap(RateLimiter::new(
                config.rate_limit_max,
                config.rate_limit_window_ms,
            ))
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
            .service(
                web::resource("/openapi.json")
                    .route(web::get().to(move || async move { web::Json(openapi.clone()) })),
            )
            .service(SwaggerUi::new("/docs/{_:.*}").url("/openapi.json", ApiDoc::openapi()))
            .default_service(not_found::service())
    })
    .bind(("0.0.0.0", config.port))?
    .run();

    Ok(server)
}
