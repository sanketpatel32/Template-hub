import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("request context", () => {
  it("propagates incoming x-request-id and emits trace headers", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/ping", {
      headers: {
        "x-request-id": "req-12345",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("req-12345");
    expect(response.headers.get("x-trace-id")).toBeDefined();
    expect(response.headers.get("x-span-id")).toBeDefined();
  });

  it("adds request and trace identifiers to error responses", async () => {
    const app = createApp();

    const response = await app.request("/route-does-not-exist");

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.requestId).toBeDefined();
    expect(body.traceId).toBeDefined();
  });
});
