package com.example.template.routes;

import com.example.template.types.SuccessResponse;
import io.swagger.v3.oas.annotations.Operation;
import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PingController {
  @Operation(summary = "Ping endpoint")
  @GetMapping("/ping")
  public SuccessResponse<Map<String, Object>> ping() {
    return SuccessResponse.of(Map.of("message", "pong", "timestamp", Instant.now().toString()));
  }

  @GetMapping("/fail")
  public SuccessResponse<Map<String, Object>> fail() {
    throw new IllegalStateException("Boom");
  }
}
