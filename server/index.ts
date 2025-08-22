import 'dotenv/config';

// Forçar NODE_ENV para production para evitar problemas com Vite HMR
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { addRequestId, requestLogger } from "./lib/logger";

const app = express();

// CORS configuration - Production ready
const allowedOrigins = [
  'https://enso-frontend-pp6s.onrender.com',
  'https://controlflow.onrender.com',
  'https://enso-frontend.onrender.com',
  'https://ensoapp.netlify.app',
  'https://enso-frontend-pp6s.onrender.com', // Duplicado para garantir
  'https://enso-frontend-*.onrender.com', // Wildcard para subdomínios do Render
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:5002'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check exact match first
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
      return;
    }
    
    // Check wildcard patterns
    for (const pattern of allowedOrigins) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(origin)) {
          callback(null, true);
          return;
        }
      }
    }
    
    console.log('CORS blocked origin:', origin);
    // Em desenvolvimento, permitir todas as origens
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-API-Key', 'Cache-Control'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use(addRequestId);
app.use(requestLogger);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await storage.ensureAdminUserExists();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Erro capturado pelo middleware:', err);
    res.status(status).json({ message });
  });

  // Usar Vite em desenvolvimento, arquivos estáticos em produção
  // Forçar produção para evitar problemas com WebSocket e HMR
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER_SERVICE_NAME;
  
  if (!isProduction && app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Render define PORT=10000, localmente usamos 5002
  // No Render, usar sempre a porta definida pela plataforma
  const port = parseInt(process.env.PORT || '5002', 10);
  console.log(`🌐 Configurando servidor para porta: ${port} ${process.env.RENDER_SERVICE_NAME ? '(Render)' : '(Local)'}`);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Inicializar WebSocket APÓS o servidor estar rodando
    console.log('🔌 Inicializando WebSocket do Severino...');
    try {
      const SeverinoWebSocket = (await import('./websocket/severinoSocket')).default;
      (global as any).severinoWebSocket = new SeverinoWebSocket(server);
      console.log('✅ WebSocket do Severino inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar WebSocket:', error);
    }
  });
})();
