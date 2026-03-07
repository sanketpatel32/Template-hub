package com.example.template.middleware;

import com.example.template.observability.TracingSupport;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {
  public static final String REQUEST_ID_ATTR = "requestId";

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String requestId = request.getHeader("X-Request-Id");
    if (requestId == null || requestId.isBlank()) {
      requestId = TracingSupport.randomHex(32);
    }
    request.setAttribute(REQUEST_ID_ATTR, requestId);
    response.setHeader("X-Request-Id", requestId);
    filterChain.doFilter(request, response);
  }
}
