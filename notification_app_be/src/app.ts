/**
 * Express application factory.
 *
 * Builds and configures the app without starting an HTTP listener,
 * so the same app can be reused for tests or different bootstraps.
 */

import express, { Request, Response } from "express";
import { Log } from "logging-middleware";
import { env } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import notificationsRouter from "./routes/notifications.route";

export function createApp(): express.Application {
  const app = express();

  // Lightweight CORS to allow the frontend (localhost:3000) to call us.
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && env.allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.use(express.json());
  app.use(requestLogger);

  // Health check — useful for both monitoring and a sanity smoke test.
  app.get("/health", (_req: Request, res: Response) => {
    Log("backend", "debug", "route", "health check requested").catch(
      () => undefined
    );
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/notifications", notificationsRouter);

  // 404 fallback
  app.use((req: Request, res: Response) => {
    Log(
      "backend",
      "warn",
      "route",
      `unmatched route ${req.method} ${req.originalUrl}`
    ).catch(() => undefined);
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
}