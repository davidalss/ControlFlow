import { addHours, addDays } from 'date-fns';
import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import crypto from "crypto";
import { storage } from "./storage";
import { authenticateToken, requireRole, generateToken, hashPassword, comparePassword, type AuthRequest } from "./middleware/auth";
import { upload } from "./middleware/upload";
import { z } from "zod";
import { Solicitation, InsertSolicitation } from "../shared/schema";
import { sapIntegration } from "./sap-integration";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.static('uploads'));

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
          role: user.role
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
      if (user) {
        const token = crypto.randomBytes(20).toString('hex');
        const expires = addHours(new Date(), 1); // Token expires in 1 hour
        await storage.setUserPasswordResetToken(email, token, expires);
        // SIMULATE SENDING EMAIL: In a real app, you'd use a mailer service here.
        // For now, we log the link to the console for the developer to use.
        console.log(`Password reset link for ${email}: /reset-password?token=${token}`);
      }
      // Always return a success message to prevent email enumeration
      res.json({ message: 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.' });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
      }
      const user = await storage.findUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Token de redefinição de senha inválido ou expirado.' });
      }
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(user.id, hashedPassword);
      res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao redefinir a senha' });
    }
  });
  // #endregion

  // #region --- SAP Integration Routes ---
  app.post('/api/sap/sync-products', requireRole(['admin', 'engineering']), async (req: AuthRequest, res) => {
    try {
      const { businessUnit } = req.body;
      const products = await sapIntegration.syncProducts(businessUnit);
      res.json({ success: true, products, count: products.length });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao sincronizar produtos do SAP' });
    }
  });

  app.post('/api/sap/sync-notifications', requireRole(['admin', 'engineering']), async (req: AuthRequest, res) => {
    try {
      const { dateFrom } = req.body;
      const notifications = await sapIntegration.syncQualityNotifications(dateFrom);
      res.json({ success: true, notifications, count: notifications.length });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao sincronizar notificações do SAP' });
    }
  });

  app.post('/api/sap/send-inspection', requireRole(['admin', 'inspector', 'engineering']), async (req: AuthRequest, res) => {
    try {
      const inspectionData = req.body;
      await sapIntegration.sendInspectionResult(inspectionData);
      res.json({ success: true, message: 'Resultado da inspeção enviado para o SAP' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao enviar resultado para o SAP' });
    }
  });

  app.get('/api/sap/master-data/:type', requireRole(['admin', 'engineering']), async (req: AuthRequest, res) => {
    try {
      const { type } = req.params;
      const data = await sapIntegration.getMasterData(type as 'materials' | 'vendors' | 'plants');
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar dados mestres do SAP' });
    }
  });
  // #endregion

  // Apply authentication middleware to all subsequent /api routes
  app.use('/api', authenticateToken);

  // #region --- User Management Routes ---
  app.get('/api/auth/me', async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/users', (req, res, next) => { console.log('Requisição para criar usuário recebida.'); next(); }, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { email, password, name, expiresIn } = req.body;
      let role = req.body.role; // Get the role from the request body

      // Apply role transformations
      if (role === 'manager') {
        role = 'coordenador';
      } else if (role === 'user control') {
        role = 'block_control';
      } else if (role === 'usuário temporário') {
        role = 'temporary_viewer';
      }

      // Validate if the role is valid
      const validRoles = ['admin', 'inspector', 'engineering', 'coordenador', 'block_control', 'temporary_viewer', 'analista', 'assistente', 'lider', 'supervisor', 'p&d', 'tecnico', 'manager'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Função de usuário inválida.' });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      const hashedPassword = await hashPassword(password);
      let expiresAt = undefined;
      if (role === 'temporary_viewer' && expiresIn) {
        const now = new Date();
        if (expiresIn === '1h') expiresAt = addHours(now, 1);
        else if (expiresIn === '1d') expiresAt = addDays(now, 1);
      }
      const user = await storage.createUser({ email, password: hashedPassword, name, role, expiresAt });
      res.status(201).json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role, expiresAt: user.expiresAt }
      });
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'CREATE',
        description: `Usuário ${user.name} (${user.email}) criado com a função ${user.role}.`,
        details: JSON.stringify({ newUserId: user.id, newUserEmail: user.email, newUserRole: user.role })
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar usuários' });
    }
  });

  app.delete('/api/users/:id', async (req: AuthRequest, res) => {
    try {
      const loggedInUser = req.user;
      const userIdToDelete = req.params.id;
      if (loggedInUser?.role !== 'admin' && loggedInUser?.id !== userIdToDelete) {
        return res.status(403).json({ message: 'Você não tem permissão para executar esta ação' });
      }
      const userToDelete = await storage.getUser(userIdToDelete);
      if (!userToDelete) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      if (userToDelete.role === 'admin' && loggedInUser?.id === userIdToDelete) {
        return res.status(400).json({ message: 'Administradores não podem excluir a própria conta.' });
      }
      
      await storage.deleteUser(userIdToDelete);
      res.status(204).send();
      await storage.logAction({
        userId: loggedInUser!.id,
        userName: loggedInUser!.name,
        actionType: 'DELETE',
        description: `Usuário ${userToDelete.name} (${userToDelete.email}) deletado.`,
        details: JSON.stringify({ deletedUserId: userToDelete.id, deletedUserEmail: userToDelete.email })
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
  });

  app.patch('/api/users/:id/email', requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { newEmail } = req.body;
      const userId = req.params.id;
      if (!newEmail) {
        return res.status(400).json({ message: 'O novo e-mail é obrigatório' });
      }
      const updatedUser = await storage.updateUserEmail(userId, newEmail);
      res.json(updatedUser);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: `Email do usuário ${updatedUser.name} alterado para ${newEmail}.`,
        details: JSON.stringify({ updatedUserId: userId, newEmail })
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao alterar o e-mail do usuário' });
    }
  });

  app.post('/api/users/:id/send-reset-link', requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      const token = crypto.randomBytes(20).toString('hex');
      const expires = addHours(new Date(), 1); // Token expires in 1 hour
      await storage.setUserPasswordResetToken(user.email, token, expires);
      const resetLink = `/reset-password?token=${token}`;
      res.json({ message: 'Link de redefinição gerado com sucesso.', resetLink });
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'ACTION',
        description: `Link de redefinição de senha gerado para o usuário ${user.name}.`,
        details: { targetUserId: user.id }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao gerar link de redefinição' });
    }
  });

  // Profile management routes
  app.put('/api/users/profile', async (req: AuthRequest, res) => {
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

  app.post('/api/users/photo', upload.single('photo'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhuma foto enviada' });
      }

      const userId = req.user!.id;
      const photoUrl = `/uploads/${req.file.filename}`;
      
      await storage.updateUserPhoto(userId, photoUrl);
      res.json({ photoUrl });
      
      await storage.logAction({
        userId: userId,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: 'Foto do perfil atualizada',
        details: { photoUrl }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao fazer upload da foto' });
    }
  });

  app.post('/api/users/change-password', async (req: AuthRequest, res) => {
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

  app.post('/api/users/change-email', async (req: AuthRequest, res) => {
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

  // Middleware for logging page access (now authenticated)
  app.use(async (req: AuthRequest, res, next) => {
    if (req.user && req.method === 'GET' && !req.path.startsWith('/api')) {
      await storage.logAction({
        userId: req.user.id,
        userName: req.user.name,
        actionType: 'ACCESS',
        description: `Acessou a página: ${req.path}`,
        details: { path: req.path }
      });
    }
    next();
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', async (req: AuthRequest, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.user?.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar métricas' });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar produtos' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
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

  app.get('/api/products/code/:code', async (req, res) => {
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

  app.post('/api/products', requireRole(['engineering', 'coordenador', 'admin']), async (req: AuthRequest, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'CREATE',
        description: `Produto ${product.code} (${product.description}) criado.`,
        details: { newProductId: product.id, productCode: product.code, productDescription: product.description, productEAN: product.ean }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar produto' });
    }
  });

  app.patch('/api/products/:id', requireRole(['engineering', 'coordenador', 'admin']), async (req: AuthRequest, res) => {
    try {
      const productId = req.params.id;
      const updateData = req.body;
      const updatedProduct = await storage.updateProduct(productId, updateData);
      res.json(updatedProduct);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: `Produto ${updatedProduct.code} (${updatedProduct.id}) atualizado.`, 
        details: { productId: updatedProduct.id, updateData }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
  });

  // Inspection Plan routes
  app.get('/api/inspection-plans', async (req, res) => {
    try {
      const { productId } = req.query;
      const plans = await storage.getInspectionPlans(productId as string);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar planos de inspeção' });
    }
  });

  app.get('/api/inspection-plans/active/:productId', async (req, res) => {
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

  app.post('/api/inspection-plans', requireRole(['engineering', 'admin']), async (req: AuthRequest, res) => {
    try {
      const plan = await storage.createInspectionPlan(req.body);
      res.status(201).json(plan);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'CREATE',
        description: `Plano de inspeção ${plan.version} para o produto ${plan.productId} criado.`,
        details: { planId: plan.id, productId: plan.productId, version: plan.version }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar plano de inspeção' });
    }
  });

  app.patch('/api/inspection-plans/:id', requireRole(['engineering', 'admin']), async (req: AuthRequest, res) => {
    try {
      const planId = req.params.id;
      const updateData = req.body;
      const updatedPlan = await storage.updateInspectionPlan(planId, updateData);
      res.json(updatedPlan);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: `Plano de inspeção ${updatedPlan.version} (${updatedPlan.id}) atualizado.`, 
        details: { planId: updatedPlan.id, updateData }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar plano de inspeção' });
    }
  });

  // Acceptance Recipe routes
  app.get('/api/acceptance-recipes/active/:productId', async (req, res) => {
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
  app.get('/api/inspections', async (req: AuthRequest, res) => {
    try {
      const { inspectorId } = req.query;
      const userId = req.user?.role === 'inspector' ? req.user.id : inspectorId as string;
      const inspections = await storage.getInspections(userId);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar inspeções' });
    }
  });

  app.get('/api/inspections/:id', async (req, res) => {
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

  app.post('/api/inspections', requireRole(['inspector']), async (req: AuthRequest, res) => {
    try {
      const now = new Date();
      const inspectionId = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const inspection = await storage.createInspection({
        ...req.body,
        inspectionId,
        inspectorId: req.user!.id,
      });
      
      res.status(201).json(inspection);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'CREATE',
        description: `Inspeção ${inspection.inspectionId} para o produto ${inspection.productId} criada.`,
        details: { inspectionId: inspection.inspectionId, productId: inspection.productId, status: inspection.status }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar inspeção' });
    }
  });

  app.patch('/api/inspections/:id', async (req: AuthRequest, res) => {
    try {
      const inspection = await storage.updateInspection(req.params.id, req.body);
      
      if (req.body.status === 'pending_engineering_analysis') {
        await storage.createNotification({
          userId: 'engineering-user-id', // This should be dynamic
          title: 'Inspeção Requer Análise da Engenharia',
          message: `Inspeção ${inspection.inspectionId} requer análise.`,
          type: 'approval_needed'
        });
        await storage.logAction({
          userId: req.user!.id,
          userName: req.user!.name,
          actionType: 'UPDATE',
          description: `Inspeção ${inspection.inspectionId} marcada para análise da engenharia.`,
          details: { inspectionId: inspection.inspectionId, newStatus: 'pending_engineering_analysis' }
        });
      } else if (req.body.status === 'pending' && req.body.technicalParameters) {
        const recipe = await storage.getActiveAcceptanceRecipe(inspection.productId);
        if (recipe) {
          const validation = validateParameters(req.body.technicalParameters, recipe.parameters);
          
          if (validation.hasFailedCritical) {
            await storage.updateInspection(req.params.id, { status: 'rejected' });
            await storage.logAction({ userId: req.user!.id, userName: req.user!.name, actionType: 'UPDATE', description: `Inspeção ${inspection.inspectionId} reprovada automaticamente por parâmetros críticos.` });
          } else if (validation.hasFailedNonCritical) {
            await storage.createNotification({ userId: 'engineering-user-id', title: 'Aprovação Condicional Necessária', message: `Inspeção ${inspection.inspectionId} aguarda aprovação condicional`, type: 'approval_needed' });
            await storage.logAction({ userId: req.user!.id, userName: req.user!.name, actionType: 'UPDATE', description: `Inspeção ${inspection.inspectionId} aguardando aprovação condicional.` });
          } else {
            await storage.updateInspection(req.params.id, { status: 'approved' });
            await storage.logAction({ userId: req.user!.id, userName: req.user!.name, actionType: 'UPDATE', description: `Inspeção ${inspection.inspectionId} aprovada automaticamente.` });
          }
        }
      }
      
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar inspeção' });
    }
  });

  // File upload routes
  app.post('/api/upload', upload.array('files', 10), (req, res) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const fileUrls = files?.map(file => `/uploads/${file.filename}`) || [];
      res.json({ files: fileUrls });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao fazer upload dos arquivos' });
    }
  });

  // Approval routes
  app.get('/api/approvals/pending', requireRole(['engineering', 'coordenador', 'admin']), async (req, res) => {
    try {
      const pendingApprovals = await storage.getPendingApprovals();
      res.json(pendingApprovals);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar aprovações pendentes' });
    }
  });

  app.post('/api/approvals', requireRole(['engineering', 'coordenador', 'admin']), async (req: AuthRequest, res) => {
    try {
      const { inspectionId, decision, justification, evidence } = req.body;
      
      const approvalDecision = await storage.createApprovalDecision({ inspectionId, engineerId: req.user!.id, decision, justification, evidence });
      let status = 'pending';
      if (decision === 'approve') status = 'approved';
      else if (decision === 'approve_conditional') status = 'conditionally_approved';
      else if (decision === 'reject') status = 'rejected';
      await storage.updateInspection(inspectionId, { status: status as any, completedAt: new Date() });
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'APPROVAL_DECISION',
        description: `Decisão de ${decision} para inspeção ${inspectionId}. Motivo: ${justification}.`,
        details: { inspectionId, decision, justification }
      });
      res.status(201).json(approvalDecision);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar decisão de aprovação' });
    }
  });

  // Solicitation routes
  app.post('/api/solicitations', requireRole(['tecnico', 'lider', 'supervisor', 'coordenador', 'engineering', 'manager', 'admin']), async (req: AuthRequest, res) => {
    try {
      const { title, description } = req.body;
      const newSolicitation: InsertSolicitation = {
        title,
        description,
        requesterId: req.user!.id,
        status: 'pending',
      };
      const solicitation = await storage.createSolicitation(newSolicitation);
      res.status(201).json(solicitation);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'CREATE',
        description: `Solicitação '${title}' criada por ${req.user!.name}.`,
        details: { solicitationId: solicitation.id, title, requesterId: req.user!.id }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar solicitação' });
    }
  });

  app.get('/api/solicitations/pending', requireRole(['inspector', 'lider', 'supervisor', 'coordenador', 'engineering', 'manager', 'admin']), async (req, res) => {
    try {
      const pendingSolicitations = await storage.getPendingSolicitations();
      res.json(pendingSolicitations);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar solicitações pendentes' });
    }
  });

  app.put('/api/solicitations/:id/claim', requireRole(['inspector', 'lider', 'supervisor', 'coordenador', 'engineering', 'manager', 'admin']), async (req: AuthRequest, res) => {
    try {
      const solicitationId = req.params.id;
      const inspectorId = req.user!.id;
      const solicitation = await storage.getSolicitation(solicitationId);
      if (!solicitation) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }
      if (solicitation.status !== 'pending') {
        return res.status(400).json({ message: 'Esta solicitação já foi iniciada ou concluída.' });
      }
      const updatedSolicitation = await storage.updateSolicitation(solicitationId, { status: 'in_progress', inspectorId });
      res.json(updatedSolicitation);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: `Solicitação '${solicitation.title}' (${solicitationId}) assumida por ${req.user!.name}.`,
        details: { solicitationId, status: 'in_progress', inspectorId }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao assumir solicitação' });
    }
  });

  app.put('/api/solicitations/:id/complete', requireRole(['inspector', 'lider', 'supervisor', 'coordenador', 'engineering', 'manager', 'admin']), async (req: AuthRequest, res) => {
    try {
      const solicitationId = req.params.id;
      const solicitation = await storage.getSolicitation(solicitationId);
      if (!solicitation) {
        return res.status(404).json({ message: 'Solicitação não encontrada' });
      }
      if (solicitation.status !== 'in_progress') {
        return res.status(400).json({ message: 'Esta solicitação não está em andamento.' });
      }
      const updatedSolicitation = await storage.updateSolicitation(solicitationId, { status: 'completed' });
      res.json(updatedSolicitation);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'UPDATE',
        description: `Solicitação '${solicitation.title}' (${solicitationId}) concluída por ${req.user!.name}.`,
        details: { solicitationId, status: 'completed' }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao concluir solicitação' });
    }
  });

  // Block routes
  app.get('/api/blocks', requireRole(['block_control', 'coordenador', 'admin']), async (req, res) => {
    try {
      const blocks = await storage.getBlocks();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar bloqueios' });
    }
  });

  app.post('/api/blocks', requireRole(['block_control', 'admin']), async (req: AuthRequest, res) => {
    try {
      const block = await storage.createBlock({ ...req.body, responsibleUserId: req.user!.id });
      res.status(201).json(block);
      await storage.logAction({
        userId: req.user!.id,
        userName: req.user!.name,
        actionType: 'CREATE',
        description: `Bloqueio criado para o produto ${block.productId}. Motivo: ${block.reason}.`,
        details: { blockId: block.id, productId: block.productId, reason: block.reason }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar bloqueio' });
    }
  });

  // Notification routes
  app.get('/api/notifications', async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar notificações' });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao marcar notificação como lida' });
    }
  });

  // Logs routes
  app.get('/api/logs', requireRole(['admin']), async (req, res) => {
    try {
      const logs = await storage.getLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar logs' });
    }
  });

  // Reports routes
  app.get('/api/reports', requireRole(['tecnico', 'analista', 'lider', 'supervisor', 'coordenador', 'admin']), async (req, res) => {
    try {
      // Placeholder for reports logic
      res.json({ message: 'Relatórios em desenvolvimento.' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao carregar relatórios' });
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