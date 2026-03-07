package com.example.template.observability;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics;
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {
  @Bean
  JvmMemoryMetrics jvmMemoryMetrics(MeterRegistry registry) {
    var metrics = new JvmMemoryMetrics();
    metrics.bindTo(registry);
    return metrics;
  }

  @Bean
  JvmGcMetrics jvmGcMetrics(MeterRegistry registry) {
    var metrics = new JvmGcMetrics();
    metrics.bindTo(registry);
    return metrics;
  }
}
