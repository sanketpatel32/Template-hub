#[derive(Clone, Debug)]
pub struct RequestContext {
    pub request_id: String,
    pub trace_id: String,
    pub span_id: String,
}
