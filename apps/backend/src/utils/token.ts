import { createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthTokenPayload, AuthTokens } from "../types/auth.js";

const accessTokenExpiresIn = "15m";
const refreshTokenExpiresIn = "30d";
const refreshTokenTtlMs = 30 * 24 * 60 * 60 * 1000;

export function createAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: accessTokenExpiresIn,
    jwtid: randomUUID()
  });
}

export function createRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshTokenExpiresIn,
    jwtid: randomUUID()
  });
}

export function createAuthTokens(payload: AuthTokenPayload): AuthTokens {
  return {
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload)
  };
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createRefreshTokenExpiry(now = new Date()): Date {
  return new Date(now.getTime() + refreshTokenTtlMs);
}
