export type UserRole = "CUSTOMER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type AuthenticatedRequestUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AuthTokenPayload = AuthenticatedRequestUser;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: AuthUser;
  tokens: AuthTokens;
};
