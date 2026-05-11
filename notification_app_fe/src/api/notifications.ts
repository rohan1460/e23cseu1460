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

export async function fetchNotifications(params: ListParams = {}): Promise<Notification[]> {
  const url = buildUrl(API_BASE, params);

  // Fire and forget logging so it never blocks the main UI flow
  try {
    Log("frontend", "debug", "api", `requesting url=${url}`).catch(() => {});
  } catch (e) {}

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const data = await response.json();
  return data.notifications || [];
}

export async function fetchPriorityNotifications(n: number): Promise<Notification[]> {
  const url = `${API_BASE}/priority?n=${n}`;
  
  try {
    Log("frontend", "debug", "api", `requesting priority n=${n}`).catch(() => {});
  } catch (e) {}

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const data = await response.json();
  return data.notifications || [];
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