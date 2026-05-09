import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("GET /api/health", () => {
  it("returns the API health response", async () => {
    const response = await request(createApp()).get("/api/health").expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.message, "API is healthy");
    assert.deepEqual(response.body.data, {
      status: "ok",
      service: "bikemarket-api"
    });
  });
});
