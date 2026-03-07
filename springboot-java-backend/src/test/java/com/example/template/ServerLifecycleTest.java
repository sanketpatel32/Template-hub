package com.example.template;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.template.state.ReadinessState;
import org.junit.jupiter.api.Test;

class ServerLifecycleTest {
  @Test
  void readinessStateCanTransition() {
    ReadinessState readinessState = new ReadinessState();
    assertThat(readinessState.isReady()).isTrue();
    readinessState.markReady(false);
    assertThat(readinessState.isReady()).isFalse();
  }
}
