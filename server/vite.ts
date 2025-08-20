import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import * as vite from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    // HMR completamente desabilitado para resolver problema de WebSocket
    hmr: false,
    allowedHosts: true as const,
  };

  const viteServer = await vite.createServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Aplicar middleware do Vite apenas para rotas que não são WebSocket
  // Aplicar middleware do Vite apenas para rotas que não são WebSocket ou API
  app.use((req, res, next) => {
    // Não aplicar middleware do Vite para WebSocket ou API
    if (req.path.startsWith('/ws/') || req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return next();
    }
    return viteServer.middlewares(req, res, next);
  });
  
  // Catch-all route apenas para rotas que não são WebSocket ou API
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  Build directory not found: ${distPath}, trying alternative path...`);
    const altPath = path.resolve(import.meta.dirname, "..", "client", "dist");
    if (fs.existsSync(altPath)) {
      console.log(`✅ Found client build at: ${altPath}`);
      app.use(express.static(altPath));
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(altPath, "index.html"));
      });
      return;
    }
    throw new Error(
      `Could not find the build directory: ${distPath} or ${altPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
