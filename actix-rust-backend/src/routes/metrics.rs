use actix_web::{get, web, HttpResponse};

use crate::observability::metrics::REGISTRY;

#[utoipa::path(get, path = "/metrics", responses((status = 200, body = String)))]
#[get("/metrics")]
pub async fn metrics(enabled: web::Data<bool>) -> HttpResponse {
    if !*enabled {
        return HttpResponse::NotFound().finish();
    }
    let encoder = prometheus::TextEncoder::new();
    let metric_families = REGISTRY.gather();
    let mut buffer = vec![];
    let _ = encoder.encode(&metric_families, &mut buffer);
    HttpResponse::Ok()
        .content_type("text/plain; version=0.0.4")
        .body(buffer)
}
