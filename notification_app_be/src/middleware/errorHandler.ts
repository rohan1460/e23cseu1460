/**
 * Centralised error-handling middleware.
 *
 * Express invokes this when any route or middleware passes an error
 * to next(err). It logs the failure (via the logging middleware) and
 * returns a safe JSON response — never leaking stack traces to clients.
 */

import { Request, Response, NextFunction } from "express";
import { Log } from "logging-middleware";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // next is unused but required for Express to recognise this as an error handler
  _next: NextFunction
): void {
  const message = err instanceof Error ? err.message : "Unknown error";
  const stack = err instanceof Error ? err.stack : undefined;

  Log(
    "backend",
    "error",
    "handler",
    `unhandled error on ${req.method} ${req.originalUrl}: ${message}${stack ? " | stack=" + stack.split("\n")[0] : ""}`
  ).catch(() => undefined);

  if (res.headersSent) return;

  res.status(500).json({
    error: "Internal server error",
  });
}