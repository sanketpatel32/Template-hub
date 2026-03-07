package com.example.template.middleware;

import com.example.template.errors.ErrorMap;
import com.example.template.types.ProblemDetails;
import com.example.template.types.RequestContext;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErrorHandlingAdvice {
  private static final Logger log = LoggerFactory.getLogger(ErrorHandlingAdvice.class);
  private final ErrorMap errorMap;

  public ErrorHandlingAdvice(ErrorMap errorMap) {
    this.errorMap = errorMap;
  }

  @ExceptionHandler(Throwable.class)
  public ResponseEntity<ProblemDetails> handle(Throwable throwable, HttpServletRequest request) {
    var appError = errorMap.map(throwable);
    var context = (RequestContext) request.getAttribute(RequestContextFilter.CONTEXT_ATTR);
    var problem =
        new ProblemDetails(
            appError.getType(),
            appError.getClass().getSimpleName(),
            appError.getStatus(),
            appError.getMessage(),
            request.getRequestURI(),
            appError.getCode(),
            context == null ? null : context.requestId(),
            context == null ? null : context.traceId(),
            context == null ? null : context.spanId());
    if (appError.getStatus() >= 500) {
      log.error("request_failed code={} path={}", appError.getCode(), request.getRequestURI(), throwable);
    }
    return ResponseEntity.status(appError.getStatus()).body(problem);
  }
}
