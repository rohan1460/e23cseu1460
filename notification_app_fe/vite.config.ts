import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend must run on port 3000 per the assignment brief.
// strictPort: true ensures the dev server fails fast if 3000 is
// occupied rather than silently falling back to another port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
});