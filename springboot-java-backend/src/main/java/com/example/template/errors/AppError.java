package com.example.template.errors;

public class AppError extends RuntimeException {
  private final String code;
  private final int status;
  private final String type;

  public AppError(String code, int status, String type, String message) {
    super(message);
    this.code = code;
    this.status = status;
    this.type = type;
  }

  public String getCode() {
    return code;
  }

  public int getStatus() {
    return status;
  }

  public String getType() {
    return type;
  }
}
