/**
 * API client for the notifications backend.
 *
 * Centralises base URL, query parameter handling, and error normalisation
 * so individual hooks and pages stay focused on UI logic.
 */

import { Log } from "logging-middleware";

const API_BASE = "http://localhost:4000/api/notifications";

export type NotificationType = "Event" | "Result" | "Placement";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface ListParams {
  limit?: number;
  page?: number;
  notificationType?: NotificationType;
}

interface NotificationsResponse {
  notifications: Notification[];
  count?: number;
}

export async function fetchNotifications(
  params: ListParams = {}
): Promise<Notification[]> {
  const url = buildUrl(API_BASE, params);

  await Log(
    "frontend",
    "debug",
    "api",
    `requesting notifications url=${url}`
  ).catch(() => undefined);

  const response = await fetch(url);

  if (!response.ok) {
    await Log(
      "frontend",
      "error",
      "api",
      `notifications request failed status=${response.status}`
    ).catch(() => undefined);
    throw new Error(`Failed to load notifications (status ${response.status})`);
  }

  const data = (await response.json()) as NotificationsResponse;

  await Log(
    "frontend",
    "info",
    "api",
    `received ${data.notifications.length} notifications`
  ).catch(() => undefined);

  return data.notifications;
}

export async function fetchPriorityNotifications(
  n: number
): Promise<Notification[]> {
  const url = `${API_BASE}/priority?n=${encodeURIComponent(String(n))}`;

  await Log(
    "frontend",
    "debug",
    "api",
    `requesting priority notifications n=${n}`
  ).catch(() => undefined);

  const response = await fetch(url);

  if (!response.ok) {
    await Log(
      "frontend",
      "error",
      "api",
      `priority request failed status=${response.status}`
    ).catch(() => undefined);
    throw new Error(`Failed to load priority notifications`);
  }

  const data = (await response.json()) as NotificationsResponse;

  await Log(
    "frontend",
    "info",
    "api",
    `received ${data.notifications.length} priority notifications`
  ).catch(() => undefined);

  return data.notifications;
}

function buildUrl(base: string, params: ListParams): string {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.notificationType)
    qs.set("notification_type", params.notificationType);
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}