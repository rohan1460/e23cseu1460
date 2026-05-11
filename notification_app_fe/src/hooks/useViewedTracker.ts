/**
 * Tracks which notifications the user has already viewed.
 *
 * Persists viewed IDs in localStorage so that, on subsequent visits,
 * a notification that was previously seen no longer appears "new".
 * In-memory state is kept in sync for instant UI updates.
 */

import { useCallback, useEffect, useState } from "react";
import { Log } from "logging-middleware";

const STORAGE_KEY = "notifications.viewedIds.v1";

function readFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (Array.isArray(arr)) return new Set(arr.filter((x) => typeof x === "string"));
    return new Set();
  } catch {
    return new Set();
  }
}

function writeToStorage(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Quota or permission issues — non-fatal for the app.
  }
}

export function useViewedTracker() {
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(viewedIds);
  }, [viewedIds]);

  const markViewed = useCallback((id: string) => {
    setViewedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      Log(
        "frontend",
        "debug",
        "hook",
        `notification marked viewed id=${id}`
      ).catch(() => undefined);
      return next;
    });
  }, []);

  const isViewed = useCallback(
    (id: string) => viewedIds.has(id),
    [viewedIds]
  );

  return { isViewed, markViewed };
}