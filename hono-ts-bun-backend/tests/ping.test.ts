import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("API routes", () => {
  it("returns pong from /api/v1/ping", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/ping");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: {
        message: "pong",
        version: "v1",
      },
    });
  });

  it("exposes OpenAPI docs endpoints", async () => {
    const app = createApp();

    const openApiResponse = await app.request("/openapi.json");
    const docsResponse = await app.request("/docs");

    expect(openApiResponse.status).toBe(200);
    expect((await openApiResponse.json()).openapi).toBe("3.0.3");
    expect([200, 301, 302]).toContain(docsResponse.status);
  });
});
