/**
 * Production-grade structured logger.
 *
 * - In production only ERROR and WARN levels are emitted.
 * - In development all levels are emitted.
 * - Each log entry carries a timestamp, level, context tag, and optional metadata.
 * - Errors are captured with stack traces when available.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const IS_PROD = import.meta.env.PROD;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = IS_PROD ? "warn" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
}

function formatEntry(
  level: LogLevel,
  context: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  return {
    ts: new Date().toISOString(),
    level,
    ctx: context,
    msg: message,
    ...(meta ? { meta } : {}),
  };
}

function emit(
  level: LogLevel,
  context: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  if (!shouldLog(level)) return;

  const entry = formatEntry(level, context, message, meta);

  switch (level) {
    case "error":
      console.error(`[${entry.ctx}]`, entry.msg, meta ?? "");
      // Lazy import to avoid pulling Sentry into modules that only log info/debug.
      void forwardToSentry("error", context, message, meta);
      break;
    case "warn":
      console.warn(`[${entry.ctx}]`, entry.msg, meta ?? "");
      void forwardToSentry("warning", context, message, meta);
      break;
    case "info":
      console.info(`[${entry.ctx}]`, entry.msg, meta ?? "");
      break;
    case "debug":
      console.debug(`[${entry.ctx}]`, entry.msg, meta ?? "");
      break;
  }
}

async function forwardToSentry(
  level: "warning" | "error",
  context: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  if (!IS_PROD) return; // Only ship to Sentry from production builds.
  try {
    const { captureMessage } = await import("./sentry");
    captureMessage(message, level, {
      tags: { ctx: context },
      extras: meta,
    });
  } catch {
    /* Sentry optional — never let logging break the app. */
  }
}

/**
 * Create a scoped logger for a specific module / feature.
 *
 * Usage:
 *   const log = createLogger("Cart");
 *   log.error("Failed to sync", { productId });
 */
export function createLogger(context: string) {
  return {
    debug: (msg: string, meta?: Record<string, unknown>) =>
      emit("debug", context, msg, meta),
    info: (msg: string, meta?: Record<string, unknown>) =>
      emit("info", context, msg, meta),
    warn: (msg: string, meta?: Record<string, unknown>) =>
      emit("warn", context, msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) =>
      emit("error", context, msg, meta),
  };
}

export type Logger = ReturnType<typeof createLogger>;
