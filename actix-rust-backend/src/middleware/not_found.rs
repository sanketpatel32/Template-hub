use actix_web::{web, HttpMessage, HttpResponse};

use crate::errors::app_error::AppError;
use crate::types::context::RequestContext;

pub async fn not_found(req: actix_web::HttpRequest) -> HttpResponse {
    let trace_id = req
        .extensions()
        .get::<RequestContext>()
        .map(|c| c.trace_id.clone())
        .unwrap_or_else(|| "unknown".into());

    HttpResponse::NotFound().json(AppError::NotFound.problem(trace_id, req.path().into()))
}

pub fn service() -> impl actix_web::dev::HttpServiceFactory {
    web::route().to(not_found)
}
