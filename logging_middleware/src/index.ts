/**
 * Public entry point for the logging middleware package.
 *
 * Consumers should import only from this file:
 *
 *     import { Log } from "logging-middleware";
 *     await Log("backend", "info", "service", "User created");
 *
 * Internal modules (auth, config, validator) are not exported to keep
 * the surface area small and prevent accidental coupling.
 */

export { Log } from "./logger";

// Re-export types so that strongly-typed consumers (Next, React, Express)
// can annotate their own calls without depending on internal paths.
export type {
  Stack,
  Level,
  LogPackage,
  BackendPackage,
  FrontendPackage,
  SharedPackage,
  LogResult,
} from "./types";