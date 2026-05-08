import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const dbPool = new Pool({
  connectionString: env.DATABASE_URL
});

export type DatabaseCheck = {
  connected: true;
  now: Date;
};

export async function checkDatabaseConnection(): Promise<DatabaseCheck> {
  const result = await dbPool.query<{ now: Date }>("select now() as now");
  const firstRow = result.rows[0];

  if (!firstRow) {
    throw new Error("PostgreSQL health check returned no rows");
  }

  return {
    connected: true,
    now: firstRow.now
  };
}

export async function closeDatabaseConnection(): Promise<void> {
  await dbPool.end();
}
