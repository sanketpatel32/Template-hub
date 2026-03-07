use actix_rust_backend::errors::app_error::AppError;
use actix_rust_backend::errors::error_map::normalize_error;

#[test]
fn normalize_maps_to_internal() {
    let err = normalize_error("boom");
    assert!(matches!(err, AppError::Internal));
}
