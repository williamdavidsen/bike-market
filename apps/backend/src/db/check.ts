import { checkDatabaseConnection, closeDatabaseConnection } from "./postgres.js";

try {
  const result = await checkDatabaseConnection();
  console.log(`PostgreSQL connection OK at ${result.now.toISOString()}`);
} finally {
  await closeDatabaseConnection();
}
