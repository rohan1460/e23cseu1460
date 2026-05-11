# logging-middleware

A reusable logging package for the evaluation service. Sends structured
log entries (stack, level, package, message) to the remote logs endpoint
with automatic token management.

## Install

From within another package (backend or frontend) in this repo:

```bash
npm install file:../logging_middleware
```

## Usage

```ts
import { Log } from "logging-middleware";

await Log("backend", "info", "service", "User created with id=42");
await Log("backend", "error", "db", "Connection refused on port 5432");
await Log("frontend", "warn", "hook", "useNotifications fetch retried");
```

`Log()` returns a `LogResult` and never throws — broken logging will
not crash the calling application.

## Configuration

Credentials are read from environment variables:

| Variable | Description |
|---|---|
| `LOGGER_EMAIL` | Registered email |
| `LOGGER_NAME` | Registered name |
| `LOGGER_ROLL_NO` | University roll number |
| `LOGGER_ACCESS_CODE` | Provided access code |
| `LOGGER_CLIENT_ID` | Client ID from registration |
| `LOGGER_CLIENT_SECRET` | Client secret from registration |
| `LOGGER_BASE_URL` | Optional override for the evaluation service base URL |

## Build

```bash
npm install
npm run build
```

Compiled output is placed in `dist/`.
