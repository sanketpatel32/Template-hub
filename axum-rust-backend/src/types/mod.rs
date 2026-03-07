use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: T,
    pub timestamp: DateTime<Utc>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data,
            timestamp: Utc::now(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ProblemDetails {
    #[schema(example = "https://example.com/problems/internal-server-error")]
    pub r#type: String,
    pub title: String,
    pub status: u16,
    pub detail: String,
    pub instance: String,
    pub request_id: String,
    pub trace_id: String,
    pub span_id: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct HealthData {
    pub status: &'static str,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ReadyData {
    pub ready: bool,
}

#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct PingData {
    pub message: &'static str,
}
