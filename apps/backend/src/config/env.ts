import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const configDir = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(configDir, "../../../../.env") });
config({ path: resolve(configDir, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.url().default("http://localhost:1299"),
  DATABASE_URL: z.url().default("postgresql://sykkelix:sykkelix_password@localhost:5432/sykkelix"),
  JWT_ACCESS_SECRET: z.string().min(16).default("change-me-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("change-me-refresh-secret")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${z.prettifyError(parsedEnv.error)}`);
}

export const env = parsedEnv.data;
