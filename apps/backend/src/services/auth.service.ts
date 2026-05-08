import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/app-error.js";
import type { AuthResult, AuthTokens, AuthUser, UserRole } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  createAuthTokens,
  createRefreshTokenExpiry,
  hashRefreshToken,
  verifyRefreshToken
} from "../utils/token.js";

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export interface AuthService {
  register(input: RegisterInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
  getCurrentUser(userId: string): Promise<AuthUser>;
}

type DatabaseUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

function toAuthUser(user: DatabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class PrismaAuthService implements AuthService {
  public async register(input: RegisterInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new AppError("Email is already registered", 409, "EMAIL_ALREADY_REGISTERED");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone
      }
    });

    return this.createAuthResult(toAuthUser(user));
  }

  public async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(input.email) }
    });

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    return this.createAuthResult(toAuthUser(user));
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      storedToken.userId !== payload.id
    ) {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    return this.createAndStoreTokens(toAuthUser(storedToken.user));
  }

  public async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  public async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("Authenticated user was not found", 401, "UNAUTHENTICATED");
    }

    return toAuthUser(user);
  }

  private async createAuthResult(user: AuthUser): Promise<AuthResult> {
    return {
      user,
      tokens: await this.createAndStoreTokens(user)
    };
  }

  private async createAndStoreTokens(user: AuthUser): Promise<AuthTokens> {
    const tokens = createAuthTokens({
      id: user.id,
      email: user.email,
      role: user.role
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(tokens.refreshToken),
        expiresAt: createRefreshTokenExpiry()
      }
    });

    return tokens;
  }
}

export const authService = new PrismaAuthService();
