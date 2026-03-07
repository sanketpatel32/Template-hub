package com.example.template;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MetricsTest {
  @Autowired private TestRestTemplate restTemplate;

  @Test
  void metricsReturnsPrometheusContent() {
    ResponseEntity<String> response = restTemplate.getForEntity("/metrics", String.class);
    assertThat(response.getStatusCode().value()).isEqualTo(200);
    assertThat(response.getBody()).contains("jvm_memory");
  }

  @Test
  void docsAndOpenApiWork() {
    assertThat(restTemplate.getForEntity("/openapi.json", String.class).getStatusCode().value()).isEqualTo(200);
    assertThat(restTemplate.getForEntity("/docs", String.class).getStatusCode().value()).isEqualTo(302);
  }
}
