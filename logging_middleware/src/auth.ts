/**
 * Authentication helper for the logging middleware.
 *
 * Responsibilities:
 *  - Fetches a Bearer token from the evaluation service's /auth endpoint.
 *  - Caches the token in memory and reuses it until shortly before expiry.
 *  - Coalesces concurrent refresh attempts into a single in-flight request,
 *    so a burst of Log() calls won't trigger multiple parallel /auth hits.
 *
 * The token is never persisted to disk. A fresh process gets a fresh token.
 */

import { AuthCredentials, AuthResponse, CachedToken } from "./types";
import { endpoint, loadCredentials } from "./config";

// Safety margin: refresh the token a minute before its real expiry to
// avoid edge cases where the token expires mid-request due to clock skew.
const EXPIRY_SAFETY_MARGIN_MS = 60 * 1000;

let cachedToken: CachedToken | null = null;
let inFlightRefresh: Promise<string> | null = null;

/**
 * Returns a valid Bearer token, refreshing it if expired or absent.
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Use cached token if still valid
  if (cachedToken && cachedToken.expiresAt - EXPIRY_SAFETY_MARGIN_MS > now) {
    return cachedToken.token;
  }

  // If a refresh is already in progress, await it instead of starting another
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  // Begin a new refresh and store the promise so concurrent callers reuse it
  inFlightRefresh = refreshToken()
    .then((token) => {
      inFlightRefresh = null;
      return token;
    })
    .catch((err) => {
      inFlightRefresh = null;
      throw err;
    });

  return inFlightRefresh;
}

/**
 * Performs the actual HTTP call to /auth and updates the cache.
 * Kept private so callers always go through getAccessToken().
 */
async function refreshToken(): Promise<string> {
  const credentials = loadCredentials();
  const url = endpoint("/auth");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Auth request failed with status ${response.status}: ${body}`
    );
  }

  const data = (await response.json()) as AuthResponse;

  if (!data.access_token) {
    throw new Error("Auth response missing access_token field");
  }

  // The evaluation service returns expires_in as a Unix timestamp (seconds).
  // Convert to milliseconds for consistent comparison with Date.now().
  const expiresAtMs = data.expires_in * 1000;

  cachedToken = {
    token: data.access_token,
    expiresAt: expiresAtMs,
  };

  return data.access_token;
}

/**
 * Test helper that clears the in-memory token cache.
 * Useful for unit tests; not intended for production callers.
 */
export function __clearTokenCacheForTests(): void {
  cachedToken = null;
  inFlightRefresh = null;
}