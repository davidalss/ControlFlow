import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    {
      name: 'disable-hmr',
      config() {
        return {
          server: {
            hmr: false
          }
        }
      }
    },
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  root: __dirname,
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5002,
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      port: 0,
      host: null,
      protocol: null,
      clientPort: 0,
      overlay: false
    },
    watch: false
  },
  define: {
    __VITE_HMR_DISABLE__: true,
    __VITE_HMR_PORT__: 0,
    __VITE_HMR_HOST__: null,
    __VITE_HMR_ENABLED__: false
  },
  optimizeDeps: {
    exclude: ['@vite/client']
  },
  envPrefix: 'VITE_'
});
