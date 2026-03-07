package com.example.template;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {"app.rate-limit-window-ms=1000", "app.rate-limit-max=2"})
class ErrorHandlingTest {
  @Autowired private TestRestTemplate restTemplate;

  @Test
  void unknownRouteReturnsRfc7807NotFound() {
    ResponseEntity<Map> response = restTemplate.getForEntity("/missing", Map.class);
    assertThat(response.getStatusCode().value()).isEqualTo(404);
    assertThat(response.getBody()).containsEntry("status", 404).containsKey("type");
  }

  @Test
  void internalFailureReturnsNormalized500() {
    ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/fail", Map.class);
    assertThat(response.getStatusCode().value()).isEqualTo(500);
    assertThat(response.getBody()).containsEntry("status", 500).containsEntry("code", "INTERNAL_SERVER_ERROR");
  }

  @Test
  void rateLimitingReturns429() {
    restTemplate.getForEntity("/api/v1/ping", String.class);
    restTemplate.getForEntity("/api/v1/ping", String.class);
    ResponseEntity<Map> limited = restTemplate.getForEntity("/api/v1/ping", Map.class);
    assertThat(limited.getStatusCode().value()).isEqualTo(429);
  }
}
