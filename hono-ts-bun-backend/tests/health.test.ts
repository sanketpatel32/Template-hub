import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { markShuttingDown, resetReadiness } from "../src/state/readiness";

describe("health and readiness routes", () => {
  afterEach(() => {
    resetReadiness();
  });

  it("returns service liveness payload", async () => {
    const app = createApp();

    const response = await app.request("/health");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ok");
    expect(body.data.environment).toBeDefined();
  });

  it("returns ready state when server is available", async () => {
    const app = createApp();

    const response = await app.request("/ready");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.ready).toBe(true);
  });

  it("returns 503 problem details when shutting down", async () => {
    const app = createApp();
    markShuttingDown();

    const response = await app.request("/ready");

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe(503);
    expect(body.code).toBe("SERVICE_UNAVAILABLE");
    expect(body.type).toContain("/service-unavailable");
  });
});
