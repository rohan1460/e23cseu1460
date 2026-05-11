/**
 * All Notifications page.
 *
 * Lists every notification returned by the backend with the ability
 * to filter by type (Event / Result / Placement / All).
 */

import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Log } from "logging-middleware";
import { useNotifications } from "../hooks/useNotifications";
import { useViewedTracker } from "../hooks/useViewedTracker";
import { NotificationCard } from "../components/NotificationCard";
import type { NotificationType } from "../api/notifications";

type Filter = "All" | NotificationType;
const FILTERS: Filter[] = ["All", "Placement", "Result", "Event"];

export function AllNotifications() {
  const [filter, setFilter] = useState<Filter>("All");
  const { isViewed, markViewed } = useViewedTracker();

  useEffect(() => {
    Log("frontend", "info", "page", "AllNotifications mounted").catch(
      () => undefined
    );
  }, []);

  const params = useMemo(
    () =>
      filter === "All"
        ? {}
        : { notificationType: filter as NotificationType },
    [filter]
  );

  const { data, loading, error, reload } = useNotifications(params);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4">All Notifications</Typography>
          <Typography variant="body2">
            Everything happening across placements, results and campus events.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={reload}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            color={filter === f ? "primary" : "default"}
            variant={filter === f ? "filled" : "outlined"}
            onClick={() => {
              setFilter(f);
              Log(
                "frontend",
                "debug",
                "component",
                `filter changed to ${f}`
              ).catch(() => undefined);
            }}
            sx={{ cursor: "pointer" }}
          />
        ))}
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={28} />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info" variant="outlined">
          No notifications to show.
        </Alert>
      )}

      {!loading && !error && data.length > 0 && (
        <Stack spacing={1.5}>
          {data.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isViewed={isViewed(n.ID)}
              onView={markViewed}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}