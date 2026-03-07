use actix_service::{Service, Transform};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::http::header::{HeaderName, HeaderValue};
use actix_web::Error;
use futures_util::future::{ok, LocalBoxFuture, Ready};
use std::task::{Context, Poll};
use uuid::Uuid;

use crate::types::context::RequestContext;

pub struct RequestContextMiddleware;

impl<S, B> Transform<S, ServiceRequest> for RequestContextMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = RequestContextService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RequestContextService { service })
    }
}

pub struct RequestContextService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for RequestContextService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, mut req: ServiceRequest) -> Self::Future {
        let request_id = req
            .headers()
            .get("x-request-id")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("unknown")
            .to_string();
        let trace_id = Uuid::new_v4().simple().to_string();
        let span_id = Uuid::new_v4().simple().to_string()[..16].to_string();

        req.extensions_mut().insert(RequestContext {
            request_id,
            trace_id: trace_id.clone(),
            span_id: span_id.clone(),
        });

        let fut = self.service.call(req);
        Box::pin(async move {
            let mut res = fut.await?;
            res.headers_mut().insert(
                HeaderName::from_static("x-trace-id"),
                HeaderValue::from_str(&trace_id)
                    .unwrap_or_else(|_| HeaderValue::from_static("invalid")),
            );
            res.headers_mut().insert(
                HeaderName::from_static("x-span-id"),
                HeaderValue::from_str(&span_id)
                    .unwrap_or_else(|_| HeaderValue::from_static("invalid")),
            );
            Ok(res)
        })
    }
}
