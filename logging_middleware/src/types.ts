/**
 * Type definitions for the logging middleware.
 *
 * These types enforce that only valid stack/level/package combinations
 * are accepted at compile time, preventing runtime errors due to invalid logs.
 */

// The stack tier from which the log originates
export type Stack = "backend" | "frontend";

// Severity levels, ordered from least to most critical
export type Level = "debug" | "info" | "warn" | "error" | "fatal";

// Packages exclusive to backend applications
export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

// Packages exclusive to frontend applications
export type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

// Packages usable in both backend and frontend
export type SharedPackage = "auth" | "config" | "middleware" | "utils";

// Union of every package value the test server accepts
export type LogPackage = BackendPackage | FrontendPackage | SharedPackage;

// The shape of a single log request sent to the test server
export interface LogPayload {
  stack: Stack;
  level: Level;
  package: LogPackage;
  message: string;
}

// The shape of a successful log response from the test server
export interface LogResponse {
  logID: string;
  message: string;
}

// Internal result returned to the caller of Log()
export interface LogResult {
  success: boolean;
  logID?: string;
  error?: string;
}

// Credentials needed to authenticate with the evaluation service
export interface AuthCredentials {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

// The shape of the auth API response
export interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

// Internal token cache representation
export interface CachedToken {
  token: string;
  expiresAt: number;
}