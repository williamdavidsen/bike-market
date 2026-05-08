type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function writeLog(level: LogLevel, message: string, context?: LogContext): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {})
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      writeLog("debug", message, context);
    }
  },
  info(message: string, context?: LogContext): void {
    writeLog("info", message, context);
  },
  warn(message: string, context?: LogContext): void {
    writeLog("warn", message, context);
  },
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext =
      error instanceof Error
        ? {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack
          }
        : { error };

    writeLog("error", message, {
      ...errorContext,
      ...context
    });
  }
};
