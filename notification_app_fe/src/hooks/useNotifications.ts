import { useEffect, useState, useCallback } from "react";
import { Log } from "logging-middleware";
import {
  fetchNotifications,
  fetchPriorityNotifications,
  type Notification,
  type ListParams,
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

    // Fire and forget logging
    try {
      Log("frontend", "debug", "hook", "loading notifications").catch(() => {});
    } catch (e) {}

    fetchNotifications(params)
      .then((items) => {
        if (cancelled) return;
        setData(items);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Fetch failed");
        setLoading(false);
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

    try {
      Log("frontend", "debug", "hook", "loading priority").catch(() => {});
    } catch (e) {}

    fetchPriorityNotifications(n)
      .then((items) => {
        if (cancelled) return;
        setData(items);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Fetch failed");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [n, version]);

  return { data, loading, error, reload };
}