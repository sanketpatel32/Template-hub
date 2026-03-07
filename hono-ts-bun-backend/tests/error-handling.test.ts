import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { resetRateLimitState } from "../src/middleware/rate-limit";

describe("error handling", () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it("returns 404 for unknown routes", async () => {
    const app = createApp();

    const response = await app.request("/missing");

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.status).toBe(404);
    expect(body.code).toBe("NOT_FOUND");
    expect(body.title).toBe("Not Found");
    expect(body.type).toContain("/not-found");
    expect(body.requestId).toBeDefined();
  });

  it("returns normalized 500 payload", async () => {
    const app = createApp();
    app.get("/boom", () => {
      throw new Error("boom");
    });

    const response = await app.request("/boom");

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.status).toBe(500);
    expect(body.code).toBe("INTERNAL_SERVER_ERROR");
    expect(body.detail).toBe("Unexpected server error.");
    expect(body.title).toBe("Internal Server Error");
    expect(body.requestId).toBeDefined();
    expect(body.traceId).toBeDefined();
  });

  it("rate limits requests with 429", async () => {
    const app = createApp();

    let lastStatus = 200;
    for (let index = 0; index < 150; index += 1) {
      const response = await app.request("/health");
      lastStatus = response.status;
      if (lastStatus === 429) {
        break;
      }
    }

    expect(lastStatus).toBe(429);
  });
});
