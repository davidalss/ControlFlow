import { Router } from 'express';
import { authenticateSupabaseToken, requireRole } from '../middleware/supabaseAuth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateSupabaseToken);

// Schema de validação para criação de grupo
const createGroupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  businessUnit: z.enum(['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A']).optional()
});

// Schema de validação para atualização de grupo
const updateGroupSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  businessUnit: z.enum(['DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A']).optional()
});

// Schema de validação para adicionar membro ao grupo
const addMemberSchema = z.object({
  userId: z.string().uuid('ID do usuário inválido'),
  role: z.enum(['member', 'leader', 'admin']).default('member')
});

// GET /api/groups - Listar todos os grupos
router.get('/', requireRole(['admin', 'coordenador', 'engineering']), async (req, res) => {
  try {
    const groups = await storage.getGroups();
    res.json(groups);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/groups - Criar novo grupo
router.post('/', requireRole(['admin', 'coordenador', 'engineering']), async (req, res) => {
  try {
    const validation = createGroupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const { name, description, businessUnit } = validation.data;

    // Verificar se já existe um grupo com o mesmo nome
    const existingGroup = await storage.getGroupByName(name);
    if (existingGroup) {
      return res.status(400).json({ message: 'Já existe um grupo com este nome' });
    }

    // Criar grupo
    const group = await storage.createGroup({
      name,
      description: description || '',
      businessUnit: businessUnit || 'N/A',
      createdBy: req.user!.id
    });

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'CREATE',
      description: `Grupo "${group.name}" criado.`,
      details: JSON.stringify({ 
        groupId: group.id, 
        groupName: group.name 
      })
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/groups/:id - Buscar grupo específico
router.get('/:id', requireRole(['admin', 'coordenador', 'engineering']), async (req, res) => {
  try {
    const group = await storage.getGroup(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }
    res.json(group);
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/groups/:id - Atualizar grupo
router.put('/:id', requireRole(['admin', 'coordenador', 'engineering']), async (req, res) => {
  try {
    const validation = updateGroupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const { name, description, businessUnit } = validation.data;
    const groupId = req.params.id;

    // Verificar se o grupo existe
    const existingGroup = await storage.getGroup(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    // Verificar se já existe outro grupo com o mesmo nome (se estiver sendo alterado)
    if (name && name !== existingGroup.name) {
      const groupWithName = await storage.getGroupByName(name);
      if (groupWithName) {
        return res.status(400).json({ message: 'Já existe um grupo com este nome' });
      }
    }

    // Atualizar grupo
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (businessUnit) updateData.businessUnit = businessUnit;

    const updatedGroup = await storage.updateGroup(groupId, updateData);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'UPDATE',
      description: `Grupo "${updatedGroup.name}" atualizado.`,
      details: JSON.stringify({ 
        groupId: groupId, 
        changes: updateData 
      })
    });

    res.json(updatedGroup);
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/groups/:id - Deletar grupo
router.delete('/:id', requireRole(['admin', 'coordenador']), async (req, res) => {
  try {
    const groupId = req.params.id;

    // Verificar se o grupo existe
    const existingGroup = await storage.getGroup(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    // Verificar se o grupo tem membros
    const members = await storage.getGroupMembers(groupId);
    if (members.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar um grupo que possui membros. Remova todos os membros primeiro.' 
      });
    }

    // Deletar grupo
    await storage.deleteGroup(groupId);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'DELETE',
      description: `Grupo "${existingGroup.name}" deletado.`,
      details: JSON.stringify({ 
        groupId: groupId,
        groupName: existingGroup.name 
      })
    });

    res.json({ message: 'Grupo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar grupo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/groups/:id/members - Listar membros do grupo
router.get('/:id/members', requireRole(['admin', 'coordenador', 'engineering']), async (req, res) => {
  try {
    const groupId = req.params.id;

    // Verificar se o grupo existe
    const group = await storage.getGroup(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    const members = await storage.getGroupMembers(groupId);
    res.json(members);
  } catch (error) {
    console.error('Erro ao buscar membros do grupo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/groups/:id/members - Adicionar membro ao grupo
router.post('/:id/members', requireRole(['admin', 'coordenador', 'engineering']), async (req, res) => {
  try {
    const validation = addMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const { userId, role } = validation.data;
    const groupId = req.params.id;

    // Verificar se o grupo existe
    const group = await storage.getGroup(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    // Verificar se o usuário existe
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o usuário já é membro do grupo
    const existingMembership = await storage.getGroupMembership(groupId, userId);
    if (existingMembership) {
      return res.status(400).json({ message: 'Usuário já é membro deste grupo' });
    }

    // Adicionar membro ao grupo
    const membership = await storage.addGroupMember(groupId, userId, role);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'CREATE',
      description: `Usuário ${user.name} adicionado ao grupo "${group.name}" com role ${role}.`,
      details: JSON.stringify({ 
        groupId: groupId,
        userId: userId,
        role: role 
      })
    });

    res.status(201).json(membership);
  } catch (error) {
    console.error('Erro ao adicionar membro ao grupo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/groups/:id/members/:userId - Remover membro do grupo
router.delete('/:id/members/:userId', requireRole(['admin', 'coordenador', 'engineering']), async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.params.userId;

    // Verificar se o grupo existe
    const group = await storage.getGroup(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    // Verificar se o usuário existe
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o usuário é membro do grupo
    const existingMembership = await storage.getGroupMembership(groupId, userId);
    if (!existingMembership) {
      return res.status(400).json({ message: 'Usuário não é membro deste grupo' });
    }

    // Remover membro do grupo
    await storage.removeGroupMember(groupId, userId);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'DELETE',
      description: `Usuário ${user.name} removido do grupo "${group.name}".`,
      details: JSON.stringify({ 
        groupId: groupId,
        userId: userId 
      })
    });

    res.json({ message: 'Membro removido do grupo com sucesso' });
  } catch (error) {
    console.error('Erro ao remover membro do grupo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PATCH /api/groups/:id/members/:userId - Atualizar role do membro no grupo
router.patch('/:id/members/:userId', requireRole(['admin', 'coordenador']), async (req, res) => {
  try {
    const { role } = req.body;
    const groupId = req.params.id;
    const userId = req.params.userId;

    if (!role) {
      return res.status(400).json({ message: 'Role é obrigatória' });
    }

    if (!['member', 'leader', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role inválida' });
    }

    // Verificar se o grupo existe
    const group = await storage.getGroup(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    // Verificar se o usuário existe
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o usuário é membro do grupo
    const existingMembership = await storage.getGroupMembership(groupId, userId);
    if (!existingMembership) {
      return res.status(400).json({ message: 'Usuário não é membro deste grupo' });
    }

    // Atualizar role do membro
    const updatedMembership = await storage.updateGroupMemberRole(groupId, userId, role);

    // Log da ação
    await storage.logAction({
      userId: req.user!.id,
      userName: req.user!.name,
      actionType: 'UPDATE',
      description: `Role do usuário ${user.name} no grupo "${group.name}" alterada para ${role}.`,
      details: JSON.stringify({ 
        groupId: groupId,
        userId: userId,
        oldRole: existingMembership.role,
        newRole: role 
      })
    });

    res.json(updatedMembership);
  } catch (error) {
    console.error('Erro ao atualizar role do membro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
