import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ["babel-plugin-react-compiler"]
    }
  }), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      // Proxy auth and API calls to Fastify during local dev
      "/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
