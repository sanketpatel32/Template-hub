package com.example.template;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PingTest {
  @Autowired private TestRestTemplate restTemplate;

  @Test
  void pingReturnsExpectedPayload() {
    ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/ping", Map.class);
    assertThat(response.getStatusCode().value()).isEqualTo(200);
    var data = (Map<?, ?>) response.getBody().get("data");
    assertThat(data).containsEntry("message", "pong");
  }
}
