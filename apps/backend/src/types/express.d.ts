import type { AuthenticatedRequestUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
    }
  }
}

export {};
