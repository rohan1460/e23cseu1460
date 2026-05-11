/**
 * Repository layer: handles all HTTP communication with the
 * evaluation service's notifications endpoint.
 *
 * The repository is the only layer aware of network details
 * (URLs, headers, token). Higher layers (services, controllers)
 * stay framework- and transport-agnostic.
 */

import { Log } from "logging-middleware";
import { env } from "../config/env";
import { getEvaluationToken } from "../auth/tokenProvider";

// Shape of a single notification returned by the evaluation service.
export interface RemoteNotification {
  ID: string;
  Type: "Event" | "Result" | "Placement";
  Message: string;
  Timestamp: string;
}

interface RemoteNotificationsResponse {
  notifications: RemoteNotification[];
}

export interface FetchOptions {
  limit?: number;
  page?: number;
  notificationType?: "Event" | "Result" | "Placement";
}

/**
 * Fetches notifications from the upstream evaluation service.
 * Supports the same query parameters that the service exposes.
 */
export async function fetchNotificationsFromUpstream(
  options: FetchOptions = {}
): Promise<RemoteNotification[]> {
  const token = await getEvaluationToken();
  const url = buildUrl(options);

  await Log(
    "backend",
    "debug",
    "repository",
    `fetching notifications from upstream url=${url}`
  );

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    await Log(
      "backend",
      "error",
      "repository",
      `upstream notifications request failed status=${response.status} body=${body.slice(0, 200)}`
    );
    throw new Error(`Upstream returned status ${response.status}`);
  }

  const data = (await response.json()) as RemoteNotificationsResponse;

  if (!Array.isArray(data.notifications)) {
    await Log(
      "backend",
      "error",
      "repository",
      "upstream response missing notifications array"
    );
    throw new Error("Malformed upstream response");
  }

  await Log(
    "backend",
    "info",
    "repository",
    `fetched ${data.notifications.length} notifications from upstream`
  );

  return data.notifications;
}

function buildUrl(options: FetchOptions): string {
  const base = `${env.loggerBaseUrl.replace(/\/+$/, "")}/notifications`;
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.notificationType) {
    params.set("notification_type", options.notificationType);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}