use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use thiserror::Error;

use crate::errors::http_errors::ProblemDetails;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("resource not found")]
    NotFound,
    #[error("service not ready")]
    ServiceUnavailable,
    #[error("rate limit exceeded")]
    RateLimited,
    #[error("internal server error")]
    Internal,
}

impl AppError {
    pub fn problem(&self, trace_id: String, instance: String) -> ProblemDetails {
        let (status, title, kind, detail) = match self {
            AppError::NotFound => (
                404,
                "Not Found",
                "https://httpstatuses.com/404",
                self.to_string(),
            ),
            AppError::ServiceUnavailable => (
                503,
                "Service Unavailable",
                "https://httpstatuses.com/503",
                self.to_string(),
            ),
            AppError::RateLimited => (
                429,
                "Too Many Requests",
                "https://httpstatuses.com/429",
                self.to_string(),
            ),
            AppError::Internal => (
                500,
                "Internal Server Error",
                "https://httpstatuses.com/500",
                self.to_string(),
            ),
        };
        ProblemDetails {
            kind: kind.into(),
            title: title.into(),
            status,
            detail,
            instance,
            trace_id,
        }
    }
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::NotFound => StatusCode::NOT_FOUND,
            AppError::ServiceUnavailable => StatusCode::SERVICE_UNAVAILABLE,
            AppError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
            AppError::Internal => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).finish()
    }
}
