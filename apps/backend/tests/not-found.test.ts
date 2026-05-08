import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("unknown route", () => {
  it("returns the standard error response", async () => {
    const response = await request(createApp()).get("/api/does-not-exist").expect(404);

    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "ROUTE_NOT_FOUND");
    assert.match(response.body.error.message, /Route not found/);
  });
});
