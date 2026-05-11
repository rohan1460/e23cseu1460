/**
 * Application root.
 *
 * Wires up the MUI theme, browser router, and top-level routes.
 */

import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { theme } from "./theme";
import { Layout } from "./components/Layout";
import { AllNotifications } from "./pages/AllNotifications";
import { PriorityNotifications } from "./pages/PriorityNotifications";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<AllNotifications />} />
            <Route path="priority" element={<PriorityNotifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;