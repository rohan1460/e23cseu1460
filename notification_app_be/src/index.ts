/**
 * Server entry point.
 *
 * Validates configuration, builds the Express app, and starts the
 * HTTP listener. Top-level startup failures are logged via the
 * logging middleware (so they remain observable) before exit.
 */

import { Log } from "logging-middleware";
import { env } from "./config/env";
import { createApp } from "./app";

async function bootstrap(): Promise<void> {
  // Touch env.* once so any missing required var throws here, not later
  // during the first request — failing fast at startup is preferred.
  const _validatedPort = env.port;

  const app = createApp();

  app.listen(env.port, () => {
    Log(
      "backend",
      "info",
      "service",
      `notification backend listening on port ${env.port}`
    ).catch(() => undefined);
    // Minimal stdout marker so developers see startup confirmation
    // when running `npm run dev` — kept to a single line.
    process.stdout.write(
      `Notification backend ready on http://localhost:${env.port}\n`
    );
  });
}

bootstrap().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  Log("backend", "fatal", "service", `startup failure: ${message}`)
    .catch(() => undefined)
    .finally(() => {
      process.stderr.write(`Startup failure: ${message}\n`);
      process.exit(1);
    });
});