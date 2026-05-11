/**
 * Application shell: top app bar with brand and primary navigation.
 * Routes render inside the central content container.
 */

import { AppBar, Box, Container, Stack, Toolbar, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
            <NotificationsIcon sx={{ color: "#6E8BFF" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.2 }}>
              Notification Center
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <NavTab to="/" label="All" icon={<NotificationsIcon fontSize="small" />} end />
            <NavTab to="/priority" label="Priority" icon={<StarIcon fontSize="small" />} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}

interface NavTabProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

function NavTab({ to, label, icon, end }: NavTabProps) {
  return (
    <NavLink
      to={to}
      end={end}
      style={{ textDecoration: "none" }}
    >
      {({ isActive }) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 1.5,
            color: isActive ? "#F5F5F7" : "#9CA3AF",
            backgroundColor: isActive ? "rgba(110, 139, 255, 0.18)" : "transparent",
            fontWeight: 600,
            fontSize: 14,
            transition: "background-color 140ms ease, color 140ms ease",
            "&:hover": {
              color: "#F5F5F7",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
            },
          }}
        >
          {icon}
          <span>{label}</span>
        </Stack>
      )}
    </NavLink>
  );
}