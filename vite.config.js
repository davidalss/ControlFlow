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
                };
            }
        },
        ...(process.env.NODE_ENV !== "production" &&
            process.env.REPL_ID !== undefined
            ? [
                await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
            ]
            : []),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
            "@assets": path.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        port: 5002,
        host: true,
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
        // HMR completamente desabilitado para resolver problema de WebSocket
        hmr: {
            port: 0,
            host: null,
            protocol: null,
            clientPort: 0,
            overlay: false
        },
        watch: false
    },
    // Desabilitar HMR globalmente
    define: {
        __VITE_HMR_DISABLE__: true,
        __VITE_HMR_PORT__: 0,
        __VITE_HMR_HOST__: null,
        __VITE_HMR_ENABLED__: false
    },
    // Configurações adicionais para evitar HMR
    optimizeDeps: {
        exclude: ['@vite/client']
    },
});
