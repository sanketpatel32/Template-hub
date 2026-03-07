package com.example.template.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public record EnvConfig(
    @Min(1) int port,
    @NotBlank String env,
    @NotBlank String corsOrigin,
    @Min(1) long rateLimitWindowMs,
    @Min(1) int rateLimitMax,
    @NotBlank String logLevel,
    boolean logPretty,
    boolean trustProxy,
    @Min(1) long shutdownTimeoutMs,
    boolean metricsEnabled,
    boolean traceEnabled) {}
