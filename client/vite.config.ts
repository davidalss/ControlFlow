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
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - bibliotecas de terceiros
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'vendor-utils': ['framer-motion', 'lucide-react', 'date-fns', 'clsx', 'tailwind-merge'],
          'vendor-charts': ['recharts', 'chart.js'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          
          // Feature chunks - funcionalidades específicas
          'feature-inspections': [
            './src/pages/inspections.tsx',
            './src/components/inspection/InspectionWizard.tsx',
            './src/components/inspection/InspectionReportsList.tsx',
            './src/hooks/use-inspections.ts'
          ],
          'feature-plans': [
            './src/pages/inspection-plans.tsx',
            './src/components/inspection-plans/NewInspectionPlanForm.tsx',
            './src/components/inspection-plans/PlanForm.tsx',
            './src/hooks/use-inspection-plans.ts'
          ],
          'feature-products': [
            './src/pages/products.tsx',
            './src/components/products/product-form.tsx',
            './src/hooks/use-products.ts'
          ],
          'feature-training': [
            './src/pages/training.tsx',
            './src/pages/training/courses.tsx',
            './src/pages/training/admin.tsx',
            './src/pages/training/player.tsx'
          ],
          'feature-users': [
            './src/pages/users.tsx',
            './src/pages/profile.tsx'
          ],
          'feature-reports': [
            './src/pages/reports.tsx',
            './src/pages/indicators.tsx',
            './src/pages/spc-control.tsx'
          ]
        },
        // Otimizações adicionais
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Otimizações de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Análise de bundle
    reportCompressedSize: true,
    chunkSizeWarningLimit: 2000
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
  envPrefix: 'VITE_'
});
