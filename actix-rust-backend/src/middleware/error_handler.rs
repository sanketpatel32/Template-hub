use actix_service::{Service, Transform};
use actix_web::body::{BoxBody, MessageBody};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::{Error, HttpResponse};
use futures_util::future::{ok, LocalBoxFuture, Ready};
use std::task::{Context, Poll};

use crate::errors::app_error::AppError;
use crate::types::context::RequestContext;

pub struct ErrorHandler;

impl<S, B> Transform<S, ServiceRequest> for ErrorHandler
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: MessageBody + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type InitError = ();
    type Transform = ErrorHandlerMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(ErrorHandlerMiddleware { service })
    }
}

pub struct ErrorHandlerMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for ErrorHandlerMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: MessageBody + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let (http_req, payload) = req.into_parts();
        let req_for_err = http_req.clone();
        let srv_req = ServiceRequest::from_parts(http_req, payload);
        let fut = self.service.call(srv_req);

        Box::pin(async move {
            match fut.await {
                Ok(res) => Ok(res.map_into_boxed_body()),
                Err(_err) => {
                    let trace_id = req_for_err
                        .extensions()
                        .get::<RequestContext>()
                        .map(|c| c.trace_id.clone())
                        .unwrap_or_else(|| "unknown".into());
                    let body = AppError::Internal.problem(trace_id, req_for_err.path().into());
                    let response = HttpResponse::InternalServerError()
                        .json(body)
                        .map_into_boxed_body();
                    Ok(ServiceResponse::new(req_for_err, response))
                }
            }
        })
    }
}
