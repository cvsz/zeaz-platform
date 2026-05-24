import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DASHBOARD_HOST = process.env.ZDASH_HOST || process.env.ZEAZ_STUDIO_DASHBOARD_HOST || "127.0.0.1";
const DASHBOARD_PORT = Number(process.env.ZDASH_PORT || process.env.ZEAZ_STUDIO_DASHBOARD_PORT || 3006);
const DASHBOARD_ALLOWED_HOSTS = [
  "zdash.zeaz.dev",
  "localhost",
  "127.0.0.1",
];

export default defineConfig({
  plugins: [react()],
  server: {
    host: DASHBOARD_HOST,
    port: DASHBOARD_PORT,
    strictPort: true,
    allowedHosts: DASHBOARD_ALLOWED_HOSTS,
  },
  preview: {
    host: DASHBOARD_HOST,
    port: DASHBOARD_PORT,
    strictPort: true,
    allowedHosts: DASHBOARD_ALLOWED_HOSTS,
  },
});
