package com.example.template;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.template.errors.ErrorMap;
import com.example.template.errors.HttpErrors;
import org.junit.jupiter.api.Test;

class ErrorMapTest {
  private final ErrorMap errorMap = new ErrorMap();

  @Test
  void mapsUnknownToInternalServerError() {
    var mapped = errorMap.map(new RuntimeException("unknown"));
    assertThat(mapped).isInstanceOf(HttpErrors.InternalServerError.class);
  }
}
