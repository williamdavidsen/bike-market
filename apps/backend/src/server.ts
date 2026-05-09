import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info("Bikemarket API listening", { port: env.PORT });
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info("Closing HTTP server", { signal });
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
