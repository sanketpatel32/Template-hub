package com.example.template.errors;

import com.example.template.errors.HttpErrors.InternalServerError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.stereotype.Component;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.servlet.NoHandlerFoundException;

@Component
public class ErrorMap {
  public AppError map(Throwable error) {
    if (error instanceof AppError appError) {
      return appError;
    }
    if (error instanceof MethodArgumentNotValidException
        || error instanceof HttpMessageNotReadableException) {
      return new HttpErrors.ValidationError("Request validation failed");
    }
    if (error instanceof NoHandlerFoundException) {
      return new HttpErrors.NotFoundError("Route not found");
    }
    if (error instanceof HttpRequestMethodNotSupportedException) {
      return new HttpErrors.ValidationError("Method not allowed");
    }
    return new InternalServerError("Unexpected internal error");
  }
}
