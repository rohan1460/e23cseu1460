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

// Using a plain object to avoid parser-level generic confusion
const COLOR_MAP = {
  Placement: "primary", // #6E8BFF
  Result: "success",    // #34D399
  Event: "warning",     // #FBBF24
} as const;

interface Props {
  data: Notification;
  viewed: boolean;
  onMarkAsRead: (id: string) => void;
}

export function NotificationCard({ data, viewed, onMarkAsRead }: Props) {
  const typeKey = data.Type as NotificationType;
  const chipColor = COLOR_MAP[typeKey] || "default";

  // Accent border color based on type, only visible if not viewed
  const accent = viewed 
    ? "transparent" 
    : (chipColor === "primary" ? "#6E8BFF" : chipColor === "success" ? "#34D399" : "#FBBF24");

  return (
    <Card
      onClick={() => onMarkAsRead(data.ID)}
      sx={{
        cursor: "pointer",
        position: "relative",
        mb: 2,
        opacity: viewed ? 0.7 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateX(4px)",
          borderColor: "rgba(110, 139, 255, 0.5)",
        },
      }}
    >
      {/* Status indicator strip */}
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
            label={data.Type} 
            size="small" 
            color={chipColor as any} 
            sx={{ fontWeight: 700, borderRadius: '6px' }}
          />
          {!viewed && (
            <Typography variant="caption" sx={{ color: "#6E8BFF", fontWeight: 800 }}>
              NEW UPDATE
            </Typography>
          )}
        </Stack>

        <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1 }}>
          {data.Message}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {new Date(data.Timestamp.replace(' ', 'T')).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}