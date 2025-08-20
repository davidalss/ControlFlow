import { addHours, addDays } from 'date-fns';
import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import crypto from "crypto";
import { storage } from "./storage";
import { authenticateToken, requireRole, generateToken, hashPassword, comparePassword, type AuthRequest } from "./middleware/auth";
import { authenticateSupabaseToken } from './middleware/supabaseAuth';
import { upload } from "./middleware/upload";
import { z } from "zod";
import { Solicitation, InsertSolicitation } from "../shared/schema";
import { sapIntegration } from "./sap-integration";
import path from 'path';
import { fileURLToPath } from 'url';
import severinoRoutes from './routes/severino';
import chatRoutes from './routes/chat';
import productsRoutes from './routes/products';
import inspectionPlansRoutes from './routes/inspection-plans';
import questionRecipesRoutes from './routes/question-recipes';
import logsRoutes from './routes/logs';
import rncRoutes from './routes/rnc';
import sgqRoutes from './routes/sgq';
import suppliersRoutes from './routes/suppliers';
import usersRoutes from './routes/users';
import groupsRoutes from './routes/groups';
import SeverinoWebSocket from './websocket/severinoSocket';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/uploads', express.static('uploads'));

  // Health check endpoint for Docker
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'controlflow',
      version: '1.0.0'
    });
  });

  // Health check endpoint for Render
  app.get('/api/health', async (req, res) => {
    const startTime = Date.now();
    
    try {
      // Verificar conexão com o banco de dados
      const dbCheck = await storage.db.execute('SELECT 1 as health_check');
      
      // Verificar se as tabelas principais existem
      const tablesCheck = await storage.db.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('inspection_plans', 'users', 'products')
      `);
      
      const duration = Date.now() - startTime;
      
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        service: 'enso-backend',
        version: '1.0.0',
        database: {
          connected: true,
          responseTime: duration,
          tables: tablesCheck.map((row: any) => row.table_name)
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      };
      
      res.status(200).json(healthStatus);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const healthStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        service: 'enso-backend',
        version: '1.0.0',
        database: {
          connected: false,
          error: error.message,
          responseTime: duration
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      };
      
      res.status(503).json(healthStatus);
    }
  });

  // WebSocket status endpoint
  app.get('/api/websocket/status', (req, res) => {
    const wsStatus = {
      available: true,
      endpoint: '/ws/severino',
      protocol: 'wss',
      timestamp: new Date().toISOString(),
      connections: (global as any).severinoWebSocket?.getConnectionCount() || 0
    };
    res.status(200).json(wsStatus);
  });

  // Test endpoint for WebSocket
  app.get('/api/websocket/test', (req, res) => {
    res.status(200).json({
      message: 'WebSocket endpoint is available',
      testUrl: 'wss://enso-backend-0aa1.onrender.com/ws/severino',
      timestamp: new Date().toISOString()
    });
  });

  // New route to serve the inspection plan template
  app.get('/public/inspection-plan-template', (req, res) => {
    const filePath = path.join(__dirname, '..', 'PLANOMODELO.html');
    res.sendFile(filePath);
  });

  // #region --- Public Auth Routes ---
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
      }
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          photo: user.photo,
          businessUnit: user.businessUnit
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      const token = crypto.randomBytes(20).toString('hex');
      const expires = addHours(new Date(), 1);
      await storage.setUserPasswordResetToken(email, token, expires);
      // In a real app, you would send an email here
      res.json({ message: 'Link de redefinição enviado para o email' });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const user = await storage.findUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.get('/api/sap/master-data', async (req, res) => {
    try {
      const masterData = await sapIntegration.getMasterData();
      res.json(masterData);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar dados mestres do SAP' });
    }
  });

  // Debug endpoint for inspection plans (sem autenticação)
  app.get('/api/inspection-plans/debug', async (req, res) => {
    try {
      // Verificar se a tabela existe
      const tableCheck = await storage.db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'inspection_plans'
        );
      `);
      
      res.json({
        message: 'Debug endpoint funcionando',
        timestamp: new Date().toISOString(),
        tableExists: tableCheck[0].exists,
        path: req.path,
        headers: req.headers
      });
    } catch (error: any) {
      res.status(500).json({
        message: 'Erro no debug endpoint',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  // #endregion

  // Apply Supabase Auth middleware to all subsequent /api routes (except Severino and auth routes)
  app.use('/api', (req, res, next) => {
    // Skip authentication for auth routes and severino
    if (req.path.startsWith('/auth') || req.path.startsWith('/severino')) return next();
    
    // Skip authentication for health check endpoints
    if (req.path === '/health') return next();
    
    // Skip authentication for test and debug endpoints
    if (req.path.includes('/test') || req.path.includes('/debug')) return next();
    
    // Skip authentication for websocket test endpoints
    if (req.path.includes('/websocket/test')) return next();
    
    return authenticateSupabaseToken(req as any, res, next);
  });

  // #region --- Auth Routes ---
  app.get('/api/auth/me', async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Profile management routes
  app.put('/api/users/profile', authenticateSupabaseToken, async (req: AuthRequest, res) => {
    try {
      const { name, businessUnit } = req.body;
      const userId = req.user!.id;
      
      if (!name) {
        return res.status(400).json({ message: 'Nome é obrigatório' });
      }

      const updatedUser = await storage.updateUserProfile(userId, { name, businessUnit });
      res.json({ 
        user: { 
          id: updatedUser.id, 
          email: updatedUser.email, 
          name: updatedUser.name, 
          role: updatedUser.role,
          businessUnit: updatedUser.businessUnit 
        } 
      });
      
      await storage.logAction({
        userId: userId,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: `Perfil atualizado: ${name}`,
        details: { name, businessUnit }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  });

  app.post('/api/users/photo', authenticateSupabaseToken, upload.single('photo'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhuma foto enviada' });
      }

      const userId = req.user!.id;
      const photoUrl = `/uploads/${req.file.filename}`;
      await storage.updateUserPhoto(userId, photoUrl);

      // Tenta registrar log, mas não falha a resposta caso dê erro
      try {
        await storage.logAction({
          userId: userId,
          userName: req.user!.name,
          actionType: 'UPDATE',
          description: 'Foto do perfil atualizada',
          details: { photoUrl }
        });
      } catch (logErr) {
        console.warn('Falha ao registrar log de updateUserPhoto:', logErr);
      }

      return res.json({ success: true, url: photoUrl });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao fazer upload da foto' });
    }
  });

  app.post('/api/users/change-password', authenticateSupabaseToken, async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
      }

      const user = await storage.getUser(userId);
      if (!user || !(await comparePassword(currentPassword, user.password))) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedPassword);
      res.json({ message: 'Senha alterada com sucesso' });
      
      await storage.logAction({
        userId: userId,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: 'Senha alterada',
        details: {}
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao alterar senha' });
    }
  });

  app.post('/api/users/change-email', authenticateSupabaseToken, async (req: AuthRequest, res) => {
    try {
      const { newEmail, password } = req.body;
      const userId = req.user!.id;
      
      if (!newEmail || !password) {
        return res.status(400).json({ message: 'Novo email e senha são obrigatórios' });
      }

      const user = await storage.getUser(userId);
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(400).json({ message: 'Senha incorreta' });
      }

      const existingUser = await storage.getUserByEmail(newEmail);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Este email já está em uso' });
      }

      await storage.updateUserEmail(userId, newEmail);
      res.json({ message: 'Email alterado com sucesso' });
      
      await storage.logAction({
        userId: userId,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: `Email alterado para: ${newEmail}`,
        details: { oldEmail: user.email, newEmail }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao alterar email' });
    }
  });
  // #endregion

  // Severino Routes
  app.use('/api/severino', severinoRoutes);

  // Products Routes
  app.use('/api/products', productsRoutes);
  app.use('/products', productsRoutes); // Alias para compatibilidade

  // Inspection Plans Routes
  app.use('/api/inspection-plans', inspectionPlansRoutes);
  app.use('/inspection-plans', inspectionPlansRoutes); // Alias para compatibilidade

  // Question Recipes Routes
  app.use('/api/question-recipes', questionRecipesRoutes);

  // Chat Routes
  app.use('/api/chat', chatRoutes);

  // Logs Routes
  app.use('/api/logs', logsRoutes);

  // RNC Routes
  app.use('/api/rnc', rncRoutes);

  // SGQ Routes
  app.use('/api/sgq', sgqRoutes);

  // Suppliers Routes
  app.use('/api/suppliers', suppliersRoutes);

  // Users Routes
  app.use('/api/users', usersRoutes);

  // Groups Routes
  app.use('/api/groups', groupsRoutes);

  const httpServer = createServer(app);
  console.log('🌐 Servidor HTTP criado');
  
  // Initialize Severino WebSocket
  console.log('🔌 Inicializando WebSocket do Severino...');
  let severinoWebSocket;
  try {
    severinoWebSocket = new SeverinoWebSocket(httpServer);
    console.log('✅ WebSocket do Severino inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar WebSocket:', error);
  }
  
  // Make WebSocket instance available globally
  (global as any).severinoWebSocket = severinoWebSocket;
  
  return httpServer;
}

function validateParameters(measured: any, recipe: any): { hasFailedCritical: boolean; hasFailedNonCritical: boolean } {
  let hasFailedCritical = false;
  let hasFailedNonCritical = false;

  for (const [key, value] of Object.entries(measured)) {
    const recipeParam = recipe[key];
    if (!recipeParam) continue;

    const measuredValue = Number(value);
    const min = Number(recipeParam.min);
    const max = Number(recipeParam.max);

    if (measuredValue < min || measuredValue > max) {
      if (recipeParam.critical) {
        hasFailedCritical = true;
      } else {
        hasFailedNonCritical = true;
      }
    }
  }

  return { hasFailedCritical, hasFailedNonCritical };
}
