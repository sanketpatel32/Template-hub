package com.example.template.routes;

import com.example.template.state.ReadinessState;
import com.example.template.types.SuccessResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
  private final ReadinessState readinessState;

  public HealthController(ReadinessState readinessState) {
    this.readinessState = readinessState;
  }

  @GetMapping("/health")
  public SuccessResponse<Map<String, Object>> health() {
    return SuccessResponse.of(Map.of("status", "ok", "ready", readinessState.isReady()));
  }
}
