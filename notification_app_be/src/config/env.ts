/**
 * Loads and validates environment variables at startup.
 *
 * Fail-fast: if a required variable is missing, the process exits with
 * a clear message so misconfiguration is caught before the server
 * accepts any traffic.
 */

import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Required environment variable missing: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : fallback;
}

export const env = {
  port: Number(optional("PORT", "4000")),
  allowedOrigins: optional("ALLOWED_ORIGINS", "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  loggerBaseUrl: optional(
    "LOGGER_BASE_URL",
    "http://4.224.186.213/evaluation-service"
  ),
  loggerCredentials: {
    email: required("LOGGER_EMAIL"),
    name: required("LOGGER_NAME"),
    rollNo: required("LOGGER_ROLL_NO"),
    accessCode: required("LOGGER_ACCESS_CODE"),
    clientID: required("LOGGER_CLIENT_ID"),
    clientSecret: required("LOGGER_CLIENT_SECRET"),
  },
} as const;