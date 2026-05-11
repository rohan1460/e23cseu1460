/**
 * Configuration loader for the logging middleware.
 *
 * Reads credentials and endpoints from environment variables so that
 * the same package can be used safely in backend and frontend contexts
 * without hardcoding any secret values in source code.
 */

import { AuthCredentials } from "./types";

// Base URL of the evaluation service. Falls back to the documented host
// when no override is provided via environment.
const DEFAULT_BASE_URL = "http://4.224.186.213/evaluation-service";

/**
 * Resolves a value from process.env in Node, or from a globally injected
 * config object in browsers.
 */
function readEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  if (typeof window !== "undefined") {
    const globalConfig = (window as any).__LOGGER_CONFIG__;
    if (globalConfig && globalConfig[key]) {
      return globalConfig[key];
    }
  }

  return undefined;
}

/**
 * Returns the evaluation service base URL.
 */
export function getBaseUrl(): string {
  return readEnv("LOGGER_BASE_URL") ?? DEFAULT_BASE_URL;
}

/**
 * Loads the credentials required for the auth endpoint.
 * Throws a clear error if any required field is missing.
 */
export function loadCredentials(): AuthCredentials {
  const required = [
    "LOGGER_EMAIL",
    "LOGGER_NAME",
    "LOGGER_ROLL_NO",
    "LOGGER_ACCESS_CODE",
    "LOGGER_CLIENT_ID",
    "LOGGER_CLIENT_SECRET",
  ];

  const missing = required.filter((key) => !readEnv(key));
  if (missing.length > 0) {
    throw new Error(
      `Logging middleware configuration error: missing env vars [${missing.join(", ")}]`
    );
  }

  return {
    email: readEnv("LOGGER_EMAIL")!,
    name: readEnv("LOGGER_NAME")!,
    rollNo: readEnv("LOGGER_ROLL_NO")!,
    accessCode: readEnv("LOGGER_ACCESS_CODE")!,
    clientID: readEnv("LOGGER_CLIENT_ID")!,
    clientSecret: readEnv("LOGGER_CLIENT_SECRET")!,
  };
}

/**
 * Convenience helper that returns the full URL for a given path.
 */
export function endpoint(path: string): string {
  const base = getBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}