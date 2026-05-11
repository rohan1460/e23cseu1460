/**
 * Core implementation of the Log() function.
 *
 * Workflow per invocation:
 *  1. Validate input arguments.
 *  2. Acquire a Bearer token (from cache or by refreshing).
 *  3. POST the log payload to the evaluation service's /logs endpoint.
 *  4. Return a LogResult describing the outcome.
 *
 * Logging must never crash the caller. Any unexpected failure is
 * captured and returned as { success: false, error: "..." }. A fallback
 * notice is also written to stderr so that broken logging is still
 * observable during development.
 */

import {
  Stack,
  Level,
  LogPackage,
  LogPayload,
  LogResponse,
  LogResult,
} from "./types";
import { endpoint } from "./config";
import { getAccessToken } from "./auth";
import { validateLogInput } from "./validator";

/**
 * Sends a single log entry to the evaluation service.
 *
 * @param stack    The stack tier ("backend" or "frontend").
 * @param level    Severity ("debug" | "info" | "warn" | "error" | "fatal").
 * @param pkg      The package/module emitting the log.
 * @param message  Human-readable description of the event.
 * @returns        A LogResult; never throws.
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: LogPackage,
  message: string
): Promise<LogResult> {
  // Defensive runtime validation (catches misuse from plain JS callers)
  const validation = validateLogInput(stack, level, pkg, message);
  if (!validation.ok) {
    reportLoggerFailure(validation.error ?? "Unknown validation error");
    return { success: false, error: validation.error };
  }

  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const token = await getAccessToken();
    const url = endpoint("/logs");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      const errMessage = `Log API responded with status ${response.status}: ${bodyText}`;
      reportLoggerFailure(errMessage);
      return { success: false, error: errMessage };
    }

    const data = (await response.json()) as LogResponse;
    return { success: true, logID: data.logID };
  } catch (err) {
    const errMessage =
      err instanceof Error ? err.message : "Unknown error during Log()";
    reportLoggerFailure(errMessage);
    return { success: false, error: errMessage };
  }
}

/**
 * Writes a fallback notice to stderr when the logger itself fails.
 * This is the ONLY place we use console output, and it exists purely
 * to make broken logging visible during development. Production callers
 * should monitor the returned LogResult instead.
 */
function reportLoggerFailure(message: string): void {
  // eslint-disable-next-line no-console
  if (typeof process !== "undefined" && process.stderr && typeof process.stderr.write === "function") {
    process.stderr.write(`[logger-failure] ${message}\n`);
  } else {
    // eslint-disable-next-line no-console
    console.error(`[logger-failure] ${message}`);
  }
}