import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST || "127.0.0.1";

export default defineConfig(async () => ({
  plugins: [react()],
  clearScreen: false,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: host,
    hmr: {
      protocol: "ws",
      host: host,
      port: 5183,
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
