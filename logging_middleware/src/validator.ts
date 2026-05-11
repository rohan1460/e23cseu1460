/**
 * Runtime validation for Log() inputs.
 *
 * TypeScript catches most invalid stack/level/package values at compile
 * time, but when this package is consumed from plain JavaScript (or
 * dynamically-typed callers), we still need a defensive runtime check.
 *
 * The validator enforces three rules from the evaluation service spec:
 *  1. stack/level/package values must be strictly lowercase.
 *  2. They must belong to the enumerated whitelist.
 *  3. message must be a non-empty string.
 */

import {
  Stack,
  Level,
  LogPackage,
  BackendPackage,
  FrontendPackage,
  SharedPackage,
} from "./types";

const STACK_VALUES: readonly Stack[] = ["backend", "frontend"];
const LEVEL_VALUES: readonly Level[] = [
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
];

const BACKEND_PACKAGES: readonly BackendPackage[] = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
];

const FRONTEND_PACKAGES: readonly FrontendPackage[] = [
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
];

const SHARED_PACKAGES: readonly SharedPackage[] = [
  "auth",
  "config",
  "middleware",
  "utils",
];

const ALL_PACKAGES: readonly LogPackage[] = [
  ...BACKEND_PACKAGES,
  ...FRONTEND_PACKAGES,
  ...SHARED_PACKAGES,
];

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validates the four arguments passed to Log().
 * Also enforces that a package only appears in its allowed stack
 * (e.g., 'db' on the 'frontend' stack is rejected).
 */
export function validateLogInput(
  stack: unknown,
  level: unknown,
  pkg: unknown,
  message: unknown
): ValidationResult {
  if (typeof stack !== "string" || !STACK_VALUES.includes(stack as Stack)) {
    return {
      ok: false,
      error: `Invalid stack '${String(stack)}'. Expected one of: ${STACK_VALUES.join(", ")}`,
    };
  }

  if (typeof level !== "string" || !LEVEL_VALUES.includes(level as Level)) {
    return {
      ok: false,
      error: `Invalid level '${String(level)}'. Expected one of: ${LEVEL_VALUES.join(", ")}`,
    };
  }

  if (typeof pkg !== "string" || !ALL_PACKAGES.includes(pkg as LogPackage)) {
    return {
      ok: false,
      error: `Invalid package '${String(pkg)}'.`,
    };
  }

  // Cross-validate package against stack
  const stackTyped = stack as Stack;
  const pkgTyped = pkg as LogPackage;

  if (
    stackTyped === "backend" &&
    FRONTEND_PACKAGES.includes(pkgTyped as FrontendPackage)
  ) {
    return {
      ok: false,
      error: `Package '${pkgTyped}' is not allowed on the 'backend' stack.`,
    };
  }

  if (
    stackTyped === "frontend" &&
    BACKEND_PACKAGES.includes(pkgTyped as BackendPackage)
  ) {
    return {
      ok: false,
      error: `Package '${pkgTyped}' is not allowed on the 'frontend' stack.`,
    };
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return {
      ok: false,
      error: "Message must be a non-empty string.",
    };
  }

  return { ok: true };
}