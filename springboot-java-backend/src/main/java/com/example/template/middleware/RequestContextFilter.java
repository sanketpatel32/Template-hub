package com.example.template.middleware;

import com.example.template.config.EnvConfig;
import com.example.template.observability.TracingSupport;
import com.example.template.types.RequestContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RequestContextFilter extends OncePerRequestFilter {
  public static final String CONTEXT_ATTR = "requestContext";
  private static final Logger log = LoggerFactory.getLogger(RequestContextFilter.class);
  private final EnvConfig envConfig;

  public RequestContextFilter(EnvConfig envConfig) {
    this.envConfig = envConfig;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String requestId = (String) request.getAttribute(RequestIdFilter.REQUEST_ID_ATTR);
    String traceId = readOrRandom(request, "X-Trace-Id", 32);
    String spanId = readOrRandom(request, "X-Span-Id", 16);
    RequestContext context = new RequestContext(requestId, traceId, spanId, System.currentTimeMillis());
    request.setAttribute(CONTEXT_ATTR, context);
    response.setHeader("X-Trace-Id", traceId);
    response.setHeader("X-Span-Id", spanId);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");

    try {
      chain.doFilter(request, response);
    } finally {
      long duration = System.currentTimeMillis() - context.startedAtMs();
      log.info(
          "request_complete method={} path={} status={} requestId={} traceId={} spanId={} durationMs={}",
          request.getMethod(),
          request.getRequestURI(),
          response.getStatus(),
          requestId,
          traceId,
          spanId,
          duration);
      if (envConfig.traceEnabled()) {
        log.info("span_export traceId={} spanId={} path={}", traceId, spanId, request.getRequestURI());
      }
    }
  }

  private String readOrRandom(HttpServletRequest request, String header, int length) {
    String value = request.getHeader(header);
    return (value == null || value.isBlank()) ? TracingSupport.randomHex(length) : value;
  }
}
