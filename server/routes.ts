import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { authenticateToken, requireRole, generateToken, hashPassword, comparePassword, type AuthRequest } from "./middleware/auth";
import { upload } from "./middleware/upload";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.static('uploads'));

  // Auth routes
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
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/register', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/users/:id/grant-admin', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const user = await storage.updateUserRole(req.params.id, 'admin');
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao conceder privilégios de administrador' });
    }
  });

  app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar usuários' });
    }
  });

  app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.user?.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar métricas' });
    }
  });

  // Product routes
  app.get('/api/products', authenticateToken, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar produtos' });
    }
  });

  app.get('/api/products/:id', authenticateToken, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar produto' });
    }
  });

  app.get('/api/products/code/:code', authenticateToken, async (req, res) => {
    try {
      const product = await storage.getProductByCode(req.params.code);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar produto' });
    }
  });

  app.post('/api/products', authenticateToken, requireRole(['engineering', 'manager']), async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar produto' });
    }
  });

  // Inspection Plan routes
  app.get('/api/inspection-plans', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.query;
      const plans = await storage.getInspectionPlans(productId as string);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar planos de inspeção' });
    }
  });

  app.get('/api/inspection-plans/active/:productId', authenticateToken, async (req, res) => {
    try {
      const plan = await storage.getActiveInspectionPlan(req.params.productId);
      if (!plan) {
        return res.status(404).json({ message: 'Plano de inspeção ativo não encontrado' });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar plano de inspeção' });
    }
  });

  // Acceptance Recipe routes
  app.get('/api/acceptance-recipes/active/:productId', authenticateToken, async (req, res) => {
    try {
      const recipe = await storage.getActiveAcceptanceRecipe(req.params.productId);
      if (!recipe) {
        return res.status(404).json({ message: 'Receita de aceite ativa não encontrada' });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar receita de aceite' });
    }
  });

  // Inspection routes
  app.get('/api/inspections', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { inspectorId } = req.query;
      const userId = req.user?.role === 'inspector' ? req.user.id : inspectorId as string;
      const inspections = await storage.getInspections(userId);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar inspeções' });
    }
  });

  app.get('/api/inspections/:id', authenticateToken, async (req, res) => {
    try {
      const inspection = await storage.getInspection(req.params.id);
      if (!inspection) {
        return res.status(404).json({ message: 'Inspeção não encontrada' });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar inspeção' });
    }
  });

  app.post('/api/inspections', authenticateToken, requireRole(['inspector']), async (req: AuthRequest, res) => {
    try {
      const now = new Date();
      const inspectionId = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const inspection = await storage.createInspection({
        ...req.body,
        inspectionId,
        inspectorId: req.user!.id,
      });
      
      res.status(201).json(inspection);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar inspeção' });
    }
  });

  app.patch('/api/inspections/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const inspection = await storage.updateInspection(req.params.id, req.body);
      
      // Auto-validate parameters against acceptance recipe if status is pending
      if (req.body.status === 'pending_engineering_analysis') {
        // Create notification for engineering
        await storage.createNotification({
          userId: 'engineering-user-id', // This should be dynamic, perhaps find an engineering user
          title: 'Inspeção Requer Análise da Engenharia',
          message: `Inspeção ${inspection.inspectionId} foi marcada como reprovada e requer análise da engenharia.`,
          type: 'approval_needed'
        });
      } else if (req.body.status === 'pending' && req.body.technicalParameters) {
        const recipe = await storage.getActiveAcceptanceRecipe(inspection.productId);
        if (recipe) {
          const validation = validateParameters(req.body.technicalParameters, recipe.parameters);
          
          if (validation.hasFailedCritical) {
            // Auto-reject for critical parameter failures
            await storage.updateInspection(req.params.id, { status: 'rejected' });
            
            // Create notification for engineering
            await storage.createNotification({
              userId: 'engineering-user-id', // This should be dynamic
              title: 'Inspeção Reprovada Automaticamente',
              message: `Inspeção ${inspection.inspectionId} reprovada por parâmetros críticos fora do limite`,
              type: 'rejection'
            });
          } else if (validation.hasFailedNonCritical) {
            // Keep as pending for engineering approval
            await storage.createNotification({
              userId: 'engineering-user-id', // This should be dynamic
              title: 'Aprovação Condicional Necessária',
              message: `Inspeção ${inspection.inspectionId} aguarda aprovação condicional`,
              type: 'approval_needed'
            });
          } else {
            // Auto-approve
            await storage.updateInspection(req.params.id, { status: 'approved' });
          }
        }
      }
      
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar inspeção' });
    }
  });

  // File upload routes
  app.post('/api/upload', authenticateToken, upload.array('files', 10), (req, res) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const fileUrls = files?.map(file => `/uploads/${file.filename}`) || [];
      res.json({ files: fileUrls });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao fazer upload dos arquivos' });
    }
  });

  // Approval routes
  app.get('/api/approvals/pending', authenticateToken, requireRole(['engineering']), async (req, res) => {
    try {
      const pendingApprovals = await storage.getPendingApprovals();
      res.json(pendingApprovals);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar aprovações pendentes' });
    }
  });

  app.post('/api/approvals', authenticateToken, requireRole(['engineering']), async (req: AuthRequest, res) => {
    try {
      const { inspectionId, decision, justification, evidence } = req.body;
      
      const approvalDecision = await storage.createApprovalDecision({
        inspectionId,
        engineerId: req.user!.id,
        decision,
        justification,
        evidence
      });

      // Update inspection status based on decision
      let status = 'pending';
      if (decision === 'approve') status = 'approved';
      else if (decision === 'approve_conditional') status = 'conditionally_approved';
      else if (decision === 'reject') status = 'rejected';

      await storage.updateInspection(inspectionId, { 
        status: status as any,
        completedAt: new Date()
      });

      res.status(201).json(approvalDecision);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar decisão de aprovação' });
    }
  });

  // Block routes
  app.get('/api/blocks', authenticateToken, requireRole(['block_control', 'manager']), async (req, res) => {
    try {
      const blocks = await storage.getBlocks();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar bloqueios' });
    }
  });

  app.post('/api/blocks', authenticateToken, requireRole(['block_control']), async (req: AuthRequest, res) => {
    try {
      const block = await storage.createBlock({
        ...req.body,
        responsibleUserId: req.user!.id,
      });
      res.status(201).json(block);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar bloqueio' });
    }
  });

  // Notification routes
  app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar notificações' });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao marcar notificação como lida' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function validateParameters(measured: any, recipe: any): { hasFailedCritical: boolean; hasFailedNonCritical: boolean } {
  let hasFailedCritical = false;
  let hasFailedNonCritical = false;

  for (const [param, config] of Object.entries(recipe as any)) {
    const value = measured[param];
    if (value !== undefined && config) {
      const { min, max, critical } = config as any;
      
      if (value < min || value > max) {
        if (critical) {
          hasFailedCritical = true;
        } else {
          hasFailedNonCritical = true;
        }
      }
    }
  }

  return { hasFailedCritical, hasFailedNonCritical };
}
