package com.example.template.types;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProblemDetails(
    String type,
    String title,
    int status,
    String detail,
    String instance,
    String code,
    String requestId,
    String traceId,
    String spanId) {}
