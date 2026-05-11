/**
 * Priority Inbox page.
 *
 * Displays the top-N most important unread notifications, ranked by
 * the backend's priority service (Placement > Result > Event, with
 * recency as a tiebreaker). N is user-selectable: 10 / 15 / 20.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Log } from "logging-middleware";
import { usePriorityNotifications } from "../hooks/useNotifications";
import { useViewedTracker } from "../hooks/useViewedTracker";
import { NotificationCard } from "../components/NotificationCard";
import type { NotificationType } from "../api/notifications";

type TypeFilter = "All" | NotificationType;
const TYPE_FILTERS: TypeFilter[] = ["All", "Placement", "Result", "Event"];
const N_OPTIONS = [10, 15, 20];

export function PriorityNotifications() {
  const [n, setN] = useState<number>(10);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const { isViewed, markViewed } = useViewedTracker();

  useEffect(() => {
    Log(
      "frontend",
      "info",
      "page",
      "PriorityNotifications mounted"
    ).catch(() => undefined);
  }, []);

  const { data, loading, error, reload } = usePriorityNotifications(n);

  const filtered = useMemo(
    () =>
      typeFilter === "All"
        ? data
        : data.filter((d) => d.Type === typeFilter),
    [data, typeFilter]
  );

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <StarIcon sx={{ color: "#FBBF24" }} fontSize="small" />
            <Typography variant="h4">Priority Inbox</Typography>
          </Stack>
          <Typography variant="body2">
            The most important notifications first — placements before results, results before events.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
            Show top
          </Typography>
          <Select
            size="small"
            value={n}
            onChange={(e) => {
              const next = Number(e.target.value);
              setN(next);
              Log(
                "frontend",
                "debug",
                "component",
                `priority top-N changed to ${next}`
              ).catch(() => undefined);
            }}
            sx={{ minWidth: 80 }}
          >
            {N_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>

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
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {TYPE_FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            color={typeFilter === f ? "primary" : "default"}
            variant={typeFilter === f ? "filled" : "outlined"}
            onClick={() => setTypeFilter(f)}
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

      {!loading && !error && filtered.length === 0 && (
        <Alert severity="info" variant="outlined">
          No priority notifications match the current filter.
        </Alert>
      )}

      {!loading && !error && filtered.length > 0 && (
        <Stack spacing={1.5}>
          {filtered.map((noti) => (
            <NotificationCard
              key={noti.ID}
              notification={noti}
              isViewed={isViewed(noti.ID)}
              onView={markViewed}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}