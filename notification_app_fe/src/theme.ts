/**
 * Material UI dark theme for the notification platform.
 *
 * A modern, low-light palette: deep neutral surfaces, soft white text,
 * and a refined accent for primary actions. Designed for readability
 * across desktop and mobile breakpoints without straining the eye.
 */

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6E8BFF",
      contrastText: "#0A0B0F",
    },
    secondary: {
      main: "#A1A1AA",
    },
    success: { main: "#34D399" },
    warning: { main: "#FBBF24" },
    error: { main: "#F87171" },
    info: { main: "#60A5FA" },
    background: {
      default: "#0A0B0F",
      paper: "#13151B",
    },
    text: {
      primary: "#F5F5F7",
      secondary: "#9CA3AF",
      disabled: "#52525B",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: -0.4 },
    h6: { fontWeight: 600 },
    body2: { color: "#9CA3AF" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0A0B0F",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(110, 139, 255, 0.06) 0%, transparent 40%), radial-gradient(circle at 80% 100%, rgba(110, 139, 255, 0.04) 0%, transparent 50%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(19, 21, 27, 0.85)",
          backdropFilter: "blur(12px)",
          color: "#F5F5F7",
          boxShadow: "0 1px 0 rgba(255, 255, 255, 0.06)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#13151B",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "none",
          transition: "border-color 160ms ease, transform 160ms ease",
          "&:hover": {
            borderColor: "rgba(110, 139, 255, 0.4)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          backgroundColor: "rgba(255, 255, 255, 0.06)",
          color: "#F5F5F7",
        },
        colorPrimary: {
          backgroundColor: "rgba(110, 139, 255, 0.18)",
          color: "#6E8BFF",
        },
        colorSuccess: {
          backgroundColor: "rgba(52, 211, 153, 0.16)",
          color: "#34D399",
        },
        colorWarning: {
          backgroundColor: "rgba(251, 191, 36, 0.16)",
          color: "#FBBF24",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});