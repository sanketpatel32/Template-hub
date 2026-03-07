package com.example.template.types;

public record RequestContext(String requestId, String traceId, String spanId, long startedAtMs) {}
