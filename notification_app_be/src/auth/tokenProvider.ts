/**
 * Acquires and caches the Bearer token used for the evaluation service's
 * protected endpoints (notifications). This is intentionally separate
 * from the logging middleware's internal token cache because the two
 * could (in principle) expire on different schedules; centralizing the
 * caching here keeps the repository layer simple.
 */

import { Log } from "logging-middleware";
import { env } from "../config/env";

interface CachedToken {
  token: string;
  expiresAt: number;
}

const SAFETY_MARGIN_MS = 60_000;
let cached: CachedToken | null = null;
let inFlight: Promise<string> | null = null;

export async function getEvaluationToken(): Promise<string> {
  const now = Date.now();

  if (cached && cached.expiresAt - SAFETY_MARGIN_MS > now) {
    return cached.token;
  }

  if (inFlight) return inFlight;

  inFlight = refresh()
    .then((t) => {
      inFlight = null;
      return t;
    })
    .catch((e) => {
      inFlight = null;
      throw e;
    });

  return inFlight;
}

async function refresh(): Promise<string> {
  const url = `${env.loggerBaseUrl.replace(/\/+$/, "")}/auth`;

  await Log("backend", "debug", "auth", "requesting upstream auth token");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(env.loggerCredentials),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    await Log(
      "backend",
      "fatal",
      "auth",
      `upstream auth failed status=${response.status} body=${body.slice(0, 200)}`
    );
    throw new Error(`Upstream auth failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cached = {
    token: data.access_token,
    expiresAt: data.expires_in * 1000,
  };

  await Log("backend", "info", "auth", "upstream auth token refreshed");

  return data.access_token;
}