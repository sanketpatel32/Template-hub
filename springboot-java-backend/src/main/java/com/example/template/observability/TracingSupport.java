package com.example.template.observability;

import java.security.SecureRandom;

public final class TracingSupport {
  private static final SecureRandom RANDOM = new SecureRandom();

  private TracingSupport() {}

  public static String randomHex(int length) {
    var bytes = new byte[length / 2];
    RANDOM.nextBytes(bytes);
    var builder = new StringBuilder(length);
    for (byte value : bytes) {
      builder.append(String.format("%02x", value));
    }
    return builder.toString();
  }
}
