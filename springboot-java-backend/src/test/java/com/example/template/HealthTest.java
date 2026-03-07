package com.example.template;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.template.state.ReadinessState;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HealthTest {
  @Autowired private TestRestTemplate restTemplate;
  @Autowired private ReadinessState readinessState;

  @Test
  void healthReturnsSuccess() {
    ResponseEntity<Map> response = restTemplate.getForEntity("/health", Map.class);
    assertThat(response.getStatusCode().value()).isEqualTo(200);
    assertThat(response.getBody()).containsEntry("success", true);
  }

  @Test
  void readyReturns200Normally() {
    readinessState.markReady(true);
    ResponseEntity<Map> response = restTemplate.getForEntity("/ready", Map.class);
    assertThat(response.getStatusCode().value()).isEqualTo(200);
    assertThat(response.getBody()).containsEntry("success", true);
  }

  @Test
  void readyReturns503WhenNotReady() {
    readinessState.markReady(false);
    ResponseEntity<Map> response = restTemplate.getForEntity("/ready", Map.class);
    assertThat(response.getStatusCode().value()).isEqualTo(503);
    assertThat(response.getBody()).containsEntry("status", 503);
    readinessState.markReady(true);
  }
}
