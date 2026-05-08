import assert from "node:assert/strict";
import { describe, it } from "node:test";
import express from "express";
import request from "supertest";
import { z } from "zod";
import { AppError } from "../src/errors/app-error.js";
import { errorMiddleware } from "../src/middlewares/error.middleware.js";
import { validateRequest } from "../src/middlewares/validate-request.middleware.js";
import { asyncHandler } from "../src/utils/async-handler.js";
import { sendSuccess } from "../src/utils/api-response.js";

function createValidationTestApp() {
  const app = express();

  app.use(express.json());
  app.post(
    "/users",
    validateRequest({
      body: z.object({
        email: z.email(),
        firstName: z.string().min(1)
      })
    }),
    (req, res) => {
      sendSuccess(res, req.body, "User payload accepted", 201);
    }
  );
  app.get(
    "/async-error",
    asyncHandler(async () => {
      throw new AppError("Async failure", 418, "ASYNC_FAILURE");
    })
  );
  app.use(errorMiddleware);

  return app;
}

describe("request validation middleware", () => {
  it("returns the standard validation error response", async () => {
    const response = await request(createValidationTestApp())
      .post("/users")
      .send({ email: "invalid", firstName: "" })
      .expect(400);

    assert.deepEqual(response.body, {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data"
      }
    });
  });

  it("passes validated requests to the controller", async () => {
    const payload = {
      email: "kunde@example.com",
      firstName: "Kari"
    };

    const response = await request(createValidationTestApp())
      .post("/users")
      .send(payload)
      .expect(201);

    assert.deepEqual(response.body, {
      success: true,
      data: payload,
      message: "User payload accepted"
    });
  });
});

describe("async handler", () => {
  it("forwards rejected controller errors to the error middleware", async () => {
    const response = await request(createValidationTestApp()).get("/async-error").expect(418);

    assert.deepEqual(response.body, {
      success: false,
      error: {
        code: "ASYNC_FAILURE",
        message: "Async failure"
      }
    });
  });
});
