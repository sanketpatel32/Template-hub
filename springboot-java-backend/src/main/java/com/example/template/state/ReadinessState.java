package com.example.template.state;

import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.stereotype.Component;

@Component
public class ReadinessState {
  private final AtomicBoolean ready = new AtomicBoolean(true);

  public boolean isReady() {
    return ready.get();
  }

  public void markReady(boolean value) {
    ready.set(value);
  }
}
