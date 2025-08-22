import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
              },
            },
          },
        ],
      },
    }),
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
    sourcemap: false,
    // Configuração simplificada para produção
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'vendor-utils': ['framer-motion', 'lucide-react', 'date-fns', 'clsx', 'tailwind-merge'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remover console em produção
        drop_debugger: true,
      }
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 2000,
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    manifest: true,
  },
  server: {
    port: 5002,
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: false,
    watch: false
  },
  define: {
    __VITE_HMR_DISABLE__: true,
    __VITE_HMR_PORT__: 0,
    __VITE_HMR_HOST__: null,
    __VITE_HMR_ENABLED__: false,
    // Adicionar timestamp de build para cache busting
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  optimizeDeps: {
    exclude: ['@vite/client'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react'
    ]
  },
  envPrefix: 'VITE_',
  // Configurações específicas para produção
  preview: {
    port: 5002,
    host: true
  }
});
