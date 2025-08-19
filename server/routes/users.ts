import { Router } from 'express';
import { authenticateSupabaseToken, requireRole } from '../middleware/supabaseAuth';
import { storage } from '../storage';
import { hashPassword } from '../middleware/auth';
import { addHours, addDays } from 'date-fns';
import { z } from 'zod';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateSupabaseToken);

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'inspector', 'engineering', 'coordenador', 'block_control', 'temporary_viewer', 'analista', 'assistente', 'lider', 'supervisor', 'p&d', 'tecnico', 'manager']),
  businessUnit: z.enum(['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A']).optional(),
  expiresIn: z.enum(['1h', '1d', 'permanent']).optional()
});

// Schema de validação para atualização de usuário
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'inspector', 'engineering', 'coordenador', 'block_control', 'temporary_viewer', 'analista', 'assistente', 'lider', 'supervisor', 'p&d', 'tecnico', 'manager']).optional(),
  businessUnit: z.enum(['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A']).optional()
});

// GET /api/users - Listar todos os usuários
router.get('/', requireRole(['admin', 'coordenador']), async (req, res) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/users - Criar novo usuário
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const { name, email, password, role, businessUnit, expiresIn } = validation.data;

    // Verificar se o email já existe
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Aplicar transformações de role
    let finalRole = role;
    if (role === 'manager') {
      finalRole = 'coordenador';
    } else if (role === 'user control') {
      finalRole = 'block_control';
    } else if (role === 'usuário temporário') {
      finalRole = 'temporary_viewer';
    }

    // Calcular data de expiração para usuários temporários
    let expiresAt = undefined;
    if (finalRole === 'temporary_viewer' && expiresIn) {
      const now = new Date();
      if (expiresIn === '1h') expiresAt = addHours(now, 1);
      else if (expiresIn === '1d') expiresAt = addDays(now, 1);
    }

    // Criar usuário
    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
      role: finalRole,
      businessUnit: businessUnit || 'N/A',
      expiresAt
    });

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'CREATE',
      description: `Usuário ${user.name} (${user.email}) criado com a função ${user.role}.`,
      details: JSON.stringify({ 
        newUserId: user.id, 
        newUserEmail: user.email, 
        newUserRole: user.role 
      })
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessUnit: user.businessUnit,
        createdAt: user.createdAt,
        expiresAt: user.expiresAt
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/users/:id - Buscar usuário específico
router.get('/:id', requireRole(['admin', 'coordenador']), async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const { name, email, role, businessUnit } = validation.data;
    const userId = req.params.id;

    // Verificar se o usuário existe
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o email já existe (se estiver sendo alterado)
    if (email && email !== existingUser.email) {
      const userWithEmail = await storage.getUserByEmail(email);
      if (userWithEmail) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
    }

    // Aplicar transformações de role
    let finalRole = role;
    if (role === 'manager') {
      finalRole = 'coordenador';
    } else if (role === 'user control') {
      finalRole = 'block_control';
    } else if (role === 'usuário temporário') {
      finalRole = 'temporary_viewer';
    }

    // Atualizar usuário
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (finalRole) updateData.role = finalRole;
    if (businessUnit) updateData.businessUnit = businessUnit;

    const updatedUser = await storage.updateUserProfile(userId, updateData);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'UPDATE',
      description: `Usuário ${updatedUser.name} (${updatedUser.email}) atualizado.`,
      details: JSON.stringify({ 
        updatedUserId: userId, 
        changes: updateData 
      })
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PATCH /api/users/:id/role - Atualizar apenas a role do usuário
router.patch('/:id/role', requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!role) {
      return res.status(400).json({ message: 'Role é obrigatória' });
    }

    // Verificar se o usuário existe
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Aplicar transformações de role
    let finalRole = role;
    if (role === 'manager') {
      finalRole = 'coordenador';
    } else if (role === 'user control') {
      finalRole = 'block_control';
    } else if (role === 'usuário temporário') {
      finalRole = 'temporary_viewer';
    }

    // Atualizar role
    const updatedUser = await storage.updateUserRole(userId, finalRole);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'UPDATE',
      description: `Role do usuário ${updatedUser.name} alterada para ${finalRole}.`,
      details: JSON.stringify({ 
        updatedUserId: userId, 
        oldRole: existingUser.role,
        newRole: finalRole 
      })
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar role do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Verificar se o usuário existe
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Não permitir deletar o próprio usuário
    if (userId === req.user!.id) {
      return res.status(400).json({ message: 'Não é possível deletar sua própria conta' });
    }

    // Deletar usuário
    await storage.deleteUser(userId);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'DELETE',
      description: `Usuário ${existingUser.name} (${existingUser.email}) deletado.`,
      details: JSON.stringify({ 
        deletedUserId: userId,
        deletedUserEmail: existingUser.email 
      })
    });

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
