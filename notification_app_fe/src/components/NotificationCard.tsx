/**
 * Individual notification item component.
 * 
 * Logic:
 * - Uses a custom dark-mode design with MUI Cards.
 * - Dynamic color mapping for Placement (Blue), Result (Green), and Event (Amber).
 * - "New" status is reflected via a left-border accent and a badge.
 */

import { Card, CardContent, Chip, Stack, Typography, Box } from "@mui/material";
import type { Notification, NotificationType } from "../api/notifications";

const COLOR_MAP = {
  Placement: "primary", // #6E8BFF
  Result: "success",    // #34D399
  Event: "warning",     // #FBBF24
} as const;

interface Props {
  notification: Notification;
  isViewed: boolean;
  onView: (id: string) => void;
}

export function NotificationCard({ notification, isViewed, onView }: Props) {
  const typeKey = notification.Type as NotificationType;
  const chipColor = COLOR_MAP[typeKey] || "default";

  const accent = isViewed 
    ? "transparent" 
    : (chipColor === "primary" ? "#6E8BFF" : chipColor === "success" ? "#34D399" : "#FBBF24");

  return (
    <Card
      onClick={() => onView(notification.ID)}
      sx={{
        cursor: "pointer",
        position: "relative",
        mb: 2,
        opacity: isViewed ? 0.7 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateX(4px)",
          borderColor: "rgba(110, 139, 255, 0.5)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: accent,
        }}
      />

      <CardContent sx={{ pl: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={1.5}>
          <Chip 
            label={notification.Type} 
            size="small" 
            color={chipColor as any} 
            sx={{ fontWeight: 700, borderRadius: '6px' }}
          />
          {!isViewed && (
            <Typography variant="caption" sx={{ color: "#6E8BFF", fontWeight: 800 }}>
              NEW UPDATE
            </Typography>
          )}
        </Stack>

        <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1 }}>
          {notification.Message}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {new Date(notification.Timestamp.replace(' ', 'T')).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}