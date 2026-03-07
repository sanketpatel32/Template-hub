package com.example.template;

import com.example.template.config.EnvConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StartupFailureLogger {
  private static final Logger log = LoggerFactory.getLogger(StartupFailureLogger.class);

  public StartupFailureLogger(EnvConfig envConfig) {
    log.info("startup env={} port={} metricsEnabled={}", envConfig.env(), envConfig.port(), envConfig.metricsEnabled());
  }
}
