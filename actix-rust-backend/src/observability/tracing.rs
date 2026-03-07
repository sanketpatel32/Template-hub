pub fn maybe_log_trace(enabled: bool, trace_id: &str, span_id: &str) {
    if enabled {
        tracing::info!(traceId = trace_id, spanId = span_id, "trace export log");
    }
}
