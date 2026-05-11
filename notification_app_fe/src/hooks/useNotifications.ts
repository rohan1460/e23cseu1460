/**
 * Hook that fetches notifications from the backend and exposes
 * loading/error state. Re-fetches whenever the input params change.
 */

import { useEffect, useState, useCallback } from "react";
import { Log } from "logging-middleware";
import {
  fetchNotifications,
  fetchPriorityNotifications,
  Notification,
  ListParams,
} from "../api/notifications";

interface UseNotificationsResult {
  data: Notification[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useNotifications(params: ListParams): UseNotificationsResult {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Log(
      "frontend",
      "debug",
      "hook",
      `useNotifications loading params=${JSON.stringify(params)}`
    ).catch(() => undefined);

    fetchNotifications(params)
      .then((items) => {
        if (cancelled) return;
        setData(items);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setLoading(false);
        Log(
          "frontend",
          "error",
          "hook",
          `useNotifications failed: ${message}`
        ).catch(() => undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [params.limit, params.page, params.notificationType, version]);

  return { data, loading, error, reload };
}

export function usePriorityNotifications(n: number): UseNotificationsResult {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Log(
      "frontend",
      "debug",
      "hook",
      `usePriorityNotifications loading n=${n}`
    ).catch(() => undefined);

    fetchPriorityNotifications(n)
      .then((items) => {
        if (cancelled) return;
        setData(items);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setLoading(false);
        Log(
          "frontend",
          "error",
          "hook",
          `usePriorityNotifications failed: ${message}`
        ).catch(() => undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [n, version]);

  return { data, loading, error, reload };
}