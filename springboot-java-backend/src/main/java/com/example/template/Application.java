package com.example.template;

import com.example.template.config.EnvConfig;
import com.example.template.state.ReadinessState;
import jakarta.annotation.PreDestroy;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@ConfigurationPropertiesScan
public class Application {
  private final ReadinessState readinessState;

  public Application(ReadinessState readinessState) {
    this.readinessState = readinessState;
  }

  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(Application.class);
    app.setDefaultProperties(Map.of("server.port", "${PORT:8080}"));
    app.run(args);
  }

  @PreDestroy
  void onShutdown() {
    readinessState.markReady(false);
  }

  @Bean
  StartupFailureLogger startupFailureLogger(EnvConfig envConfig) {
    return new StartupFailureLogger(envConfig);
  }

  @RestController
  static class ReadyController {
    private final ReadinessState readinessState;

    ReadyController(ReadinessState readinessState) {
      this.readinessState = readinessState;
    }

    @GetMapping("/ready")
    public Object ready() {
      if (!readinessState.isReady()) {
        throw new com.example.template.errors.HttpErrors.ServiceUnavailableError("Not ready");
      }
      return com.example.template.types.SuccessResponse.of(Map.of("status", "ready"));
    }

    @GetMapping("/docs")
    @ResponseStatus(HttpStatus.FOUND)
    public void docs(jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
      response.sendRedirect("/swagger-ui/index.html");
    }
  }
}
