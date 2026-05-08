import assert from "node:assert/strict";
import { describe, it } from "node:test";
import express from "express";
import request from "supertest";
import { createApp } from "../src/app.js";
import { AppError } from "../src/errors/app-error.js";
import { requireAuth, requireRole } from "../src/middlewares/auth.middleware.js";
import { errorMiddleware } from "../src/middlewares/error.middleware.js";
import type { AuthResult, AuthTokens, AuthUser, UserRole } from "../src/types/auth.js";
import type { AuthService, LoginInput, RegisterInput } from "../src/services/auth.service.js";
import { sendSuccess } from "../src/utils/api-response.js";
import { hashPassword, verifyPassword } from "../src/utils/password.js";
import {
  createAccessToken,
  createAuthTokens,
  createRefreshTokenExpiry,
  hashRefreshToken,
  verifyRefreshToken
} from "../src/utils/token.js";

type StoredUser = AuthUser & {
  passwordHash: string;
};

type StoredRefreshToken = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

class InMemoryAuthService implements AuthService {
  public readonly users = new Map<string, StoredUser>();
  public readonly refreshTokens = new Map<string, StoredRefreshToken>();
  private nextUserId = 1;

  public async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.toLowerCase();

    if ([...this.users.values()].some((user) => user.email === email)) {
      throw new AppError("Email is already registered", 409, "EMAIL_ALREADY_REGISTERED");
    }

    const user: StoredUser = {
      id: String(this.nextUserId++),
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: "CUSTOMER",
      passwordHash: await hashPassword(input.password)
    };

    this.users.set(user.id, user);

    return this.createAuthResult(user);
  }

  public async login(input: LoginInput): Promise<AuthResult> {
    const user = [...this.users.values()].find(
      (storedUser) => storedUser.email === input.email.toLowerCase()
    );

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    return this.createAuthResult(user);
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = this.refreshTokens.get(tokenHash);
    const user = this.users.get(payload.id);

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      !user ||
      storedToken.userId !== user.id
    ) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    storedToken.revokedAt = new Date();

    return this.createAndStoreTokens(user);
  }

  public async logout(refreshToken: string): Promise<void> {
    const storedToken = this.refreshTokens.get(hashRefreshToken(refreshToken));

    if (storedToken) {
      storedToken.revokedAt = new Date();
    }
  }

  public async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = this.users.get(userId);

    if (!user) {
      throw new AppError("Authenticated user was not found", 401, "UNAUTHENTICATED");
    }

    return this.toAuthUser(user);
  }

  public createUser(role: UserRole): AuthUser {
    const user: StoredUser = {
      id: String(this.nextUserId++),
      email: `${role.toLowerCase()}@example.com`,
      firstName: role,
      lastName: "User",
      role,
      passwordHash: "not-used"
    };

    this.users.set(user.id, user);

    return this.toAuthUser(user);
  }

  private async createAuthResult(user: StoredUser): Promise<AuthResult> {
    return {
      user: this.toAuthUser(user),
      tokens: await this.createAndStoreTokens(user)
    };
  }

  private async createAndStoreTokens(user: StoredUser): Promise<AuthTokens> {
    const tokens = createAuthTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    this.refreshTokens.set(hashRefreshToken(tokens.refreshToken), {
      userId: user.id,
      tokenHash: hashRefreshToken(tokens.refreshToken),
      expiresAt: createRefreshTokenExpiry(),
      revokedAt: null
    });

    return tokens;
  }

  private toAuthUser(user: StoredUser): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
}

function createRoleTestApp() {
  const app = express();

  app.get("/admin", requireAuth, requireRole("ADMIN"), (_req, res) => {
    sendSuccess(res, { allowed: true }, "Admin allowed");
  });
  app.use(errorMiddleware);

  return app;
}

describe("auth endpoints", () => {
  it("registers a user and stores a hashed password", async () => {
    const service = new InMemoryAuthService();
    const response = await request(createApp({ authService: service }))
      .post("/api/auth/register")
      .send({
        email: "Kari@example.com",
        password: "super-secret",
        firstName: "Kari",
        lastName: "Nordmann"
      })
      .expect(201);

    const user = [...service.users.values()][0];

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.email, "kari@example.com");
    assert.equal(response.body.data.user.role, "CUSTOMER");
    assert.equal(typeof response.body.data.tokens.accessToken, "string");
    assert.equal(typeof response.body.data.tokens.refreshToken, "string");
    assert.notEqual(user?.passwordHash, "super-secret");
    assert.equal(await verifyPassword("super-secret", user?.passwordHash ?? ""), true);
  });

  it("logs in and returns access and refresh tokens", async () => {
    const service = new InMemoryAuthService();
    await service.register({
      email: "kunde@example.com",
      password: "super-secret",
      firstName: "Kunde",
      lastName: "En"
    });

    const response = await request(createApp({ authService: service }))
      .post("/api/auth/login")
      .send({
        email: "kunde@example.com",
        password: "super-secret"
      })
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.data.tokens.accessToken, "string");
    assert.equal(typeof response.body.data.tokens.refreshToken, "string");
  });

  it("refreshes tokens and revokes the old refresh token", async () => {
    const service = new InMemoryAuthService();
    const registered = await service.register({
      email: "refresh@example.com",
      password: "super-secret",
      firstName: "Refresh",
      lastName: "Token"
    });

    const response = await request(createApp({ authService: service }))
      .post("/api/auth/refresh")
      .send({ refreshToken: registered.tokens.refreshToken })
      .expect(200);

    const oldToken = service.refreshTokens.get(hashRefreshToken(registered.tokens.refreshToken));

    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.data.tokens.accessToken, "string");
    assert.equal(typeof response.body.data.tokens.refreshToken, "string");
    assert.notEqual(response.body.data.tokens.refreshToken, registered.tokens.refreshToken);
    assert.ok(oldToken?.revokedAt instanceof Date);
  });

  it("logs out by revoking the refresh token", async () => {
    const service = new InMemoryAuthService();
    const registered = await service.register({
      email: "logout@example.com",
      password: "super-secret",
      firstName: "Logout",
      lastName: "User"
    });

    await request(createApp({ authService: service }))
      .post("/api/auth/logout")
      .send({ refreshToken: registered.tokens.refreshToken })
      .expect(200);

    const storedToken = service.refreshTokens.get(hashRefreshToken(registered.tokens.refreshToken));

    assert.ok(storedToken?.revokedAt instanceof Date);
  });

  it("blocks the current user endpoint without auth", async () => {
    const response = await request(createApp({ authService: new InMemoryAuthService() }))
      .get("/api/auth/me")
      .expect(401);

    assert.deepEqual(response.body, {
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication token is required"
      }
    });
  });

  it("returns the current user with a valid access token", async () => {
    const service = new InMemoryAuthService();
    const registered = await service.register({
      email: "me@example.com",
      password: "super-secret",
      firstName: "Me",
      lastName: "User"
    });

    const response = await request(createApp({ authService: service }))
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registered.tokens.accessToken}`)
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.email, "me@example.com");
  });
});

describe("role authorization", () => {
  it("allows admins and rejects customers", async () => {
    const service = new InMemoryAuthService();
    const admin = service.createUser("ADMIN");
    const customer = service.createUser("CUSTOMER");
    const adminToken = createAccessToken(admin);
    const customerToken = createAccessToken(customer);
    const app = createRoleTestApp();

    await request(app).get("/admin").set("Authorization", `Bearer ${adminToken}`).expect(200);

    const response = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${customerToken}`)
      .expect(403);

    assert.equal(response.body.error.code, "FORBIDDEN");
  });
});
