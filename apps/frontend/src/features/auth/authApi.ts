import { api } from "../../lib/api";
import type { AuthResult } from "../../types/api";

export type LoginInput = {
  email: string;
  password: string;
};

export async function login(input: LoginInput): Promise<AuthResult> {
  return api.post<AuthResult>("/auth/login", input);
}
