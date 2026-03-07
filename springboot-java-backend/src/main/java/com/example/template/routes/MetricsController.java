package com.example.template.routes;

import com.example.template.config.EnvConfig;
import com.example.template.errors.HttpErrors;
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MetricsController {
  private final PrometheusMeterRegistry registry;
  private final EnvConfig envConfig;

  public MetricsController(PrometheusMeterRegistry registry, EnvConfig envConfig) {
    this.registry = registry;
    this.envConfig = envConfig;
  }

  @GetMapping(value = "/metrics", produces = MediaType.TEXT_PLAIN_VALUE)
  public String metrics() {
    if (!envConfig.metricsEnabled()) {
      throw new HttpErrors.ServiceUnavailableError("Metrics are disabled");
    }
    return registry.scrape();
  }
}
