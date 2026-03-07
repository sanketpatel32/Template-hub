package com.example.template.middleware;

import com.example.template.config.EnvConfig;
import com.example.template.errors.HttpErrors;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.LOWEST_PRECEDENCE - 10)
public class RateLimitFilter extends OncePerRequestFilter {
  private final EnvConfig envConfig;
  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  public RateLimitFilter(EnvConfig envConfig) {
    this.envConfig = envConfig;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return request.getRequestURI().equals("/health") || request.getRequestURI().equals("/metrics");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    var now = System.currentTimeMillis();
    var source = sourceKey(request);
    var bucket = buckets.computeIfAbsent(source, ignored -> new Bucket(now, new AtomicInteger(0)));
    synchronized (bucket) {
      if (now - bucket.windowStart > envConfig.rateLimitWindowMs()) {
        bucket.windowStart = now;
        bucket.count.set(0);
      }
      if (bucket.count.incrementAndGet() > envConfig.rateLimitMax()) {
        throw new HttpErrors.RateLimitExceededError("Rate limit exceeded");
      }
    }
    chain.doFilter(request, response);
  }

  private String sourceKey(HttpServletRequest request) {
    if (envConfig.trustProxy()) {
      String forwardedFor = request.getHeader("X-Forwarded-For");
      if (forwardedFor != null && !forwardedFor.isBlank()) {
        return forwardedFor.split(",")[0].trim();
      }
    }
    return request.getRemoteAddr();
  }

  private static class Bucket {
    volatile long windowStart;
    AtomicInteger count;

    Bucket(long windowStart, AtomicInteger count) {
      this.windowStart = windowStart;
      this.count = count;
    }
  }
}
