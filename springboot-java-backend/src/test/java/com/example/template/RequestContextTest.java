package com.example.template;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RequestContextTest {
  @Autowired private TestRestTemplate restTemplate;

  @Test
  void requestIdIsPropagated() {
    HttpHeaders headers = new HttpHeaders();
    headers.add("X-Request-Id", "test-request-id");
    ResponseEntity<Map> response =
        restTemplate.exchange("/api/v1/ping", HttpMethod.GET, new HttpEntity<>(headers), Map.class);
    assertThat(response.getHeaders().getFirst("X-Request-Id")).isEqualTo("test-request-id");
  }

  @Test
  void traceIdentifiersAppearInErrors() {
    ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/fail", Map.class);
    assertThat(response.getStatusCode().value()).isEqualTo(500);
    assertThat(response.getBody()).containsKeys("traceId", "spanId", "requestId");
  }
}
