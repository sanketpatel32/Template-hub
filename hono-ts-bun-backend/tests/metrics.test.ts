import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("GET /metrics", () => {
  it("returns Prometheus metrics payload", async () => {
    const app = createApp();

    await app.request("/health");
    const response = await app.request("/metrics");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    const body = await response.text();
    expect(body).toContain("http_requests_total");
    expect(body).toContain("http_request_duration_seconds");
  });
});
