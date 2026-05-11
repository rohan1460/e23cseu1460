/**
 * Request logger middleware: emits a structured log for every
 * incoming HTTP request and its outcome. Captures method, path,
 * status, and duration to aid debugging and post-mortems.
 */

import { Request, Response, NextFunction } from "express";
import { Log } from "logging-middleware";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startedAt = Date.now();

  // Fire-and-forget: never block the request on a log call.
  Log(
    "backend",
    "info",
    "middleware",
    `incoming ${req.method} ${req.originalUrl}`
  ).catch(() => undefined);

  res.on("finish", () => {
    const elapsed = Date.now() - startedAt;
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    Log(
      "backend",
      level,
      "middleware",
      `completed ${req.method} ${req.originalUrl} status=${res.statusCode} duration=${elapsed}ms`
    ).catch(() => undefined);
  });

  next();
}