use crate::errors::app_error::AppError;

pub fn normalize_error<E>(_err: E) -> AppError {
    AppError::Internal
}
