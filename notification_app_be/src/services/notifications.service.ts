/**
 * Notifications service: orchestrates repository calls and applies
 * domain logic (filtering, priority computation) before returning data
 * to the controller. Keeps controllers thin and focused on HTTP concerns.
 */

import { Log } from "logging-middleware";
import {
  fetchNotificationsFromUpstream,
  FetchOptions,
  RemoteNotification,
} from "../repository/testServer.repo";
import { pickTopN } from "./priority.service";

export async function listNotifications(
  options: FetchOptions
): Promise<RemoteNotification[]> {
  await Log(
    "backend",
    "debug",
    "service",
    `listNotifications called with options=${JSON.stringify(options)}`
  );
  return fetchNotificationsFromUpstream(options);
}

export async function listPriorityNotifications(
  n: number
): Promise<RemoteNotification[]> {
  await Log(
    "backend",
    "info",
    "service",
    `listPriorityNotifications requested top-${n}`
  );

  // Fetch a generous window so the heap has enough data to rank.
  const notifications = await fetchNotificationsFromUpstream({});
  return pickTopN(notifications, n);
}