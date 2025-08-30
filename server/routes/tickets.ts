import { Router } from 'express';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';
import { storage } from '../storage';
import { eq, desc, and, or, like, sql } from 'drizzle-orm';
import { tickets, ticketMessages, ticketAttachments, users } from '../../shared/schema';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Configuração do Supabase para upload de arquivos
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware para autenticação
router.use(authenticateSupabaseToken);

// GET /api/tickets - Listar tickets
router.get('/', async (req, res) => {
  try {
    const { user } = req as any;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      priority, 
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    let whereConditions = [];
    
    // Se não for admin, mostrar apenas tickets do usuário ou públicos
    if (user.role !== 'admin') {
      whereConditions.push(
        or(
          eq(tickets.createdBy, user.id),
          eq(tickets.isPublic, true)
        )
      );
    }
    
    if (status) {
      whereConditions.push(eq(tickets.status, status as string));
    }
    
    if (type) {
      whereConditions.push(eq(tickets.type, type as string));
    }
    
    if (priority) {
      whereConditions.push(eq(tickets.priority, priority as string));
    }
    
    if (assignedTo) {
      whereConditions.push(eq(tickets.assignedTo, assignedTo as string));
    }
    
    if (search) {
      whereConditions.push(
        or(
          like(tickets.title, `%${search}%`),
          like(tickets.description, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Ordenação
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = sortOrder === 'desc' ? desc(tickets.title) : tickets.title;
        break;
      case 'priority':
        orderBy = sortOrder === 'desc' ? desc(tickets.priority) : tickets.priority;
        break;
      case 'status':
        orderBy = sortOrder === 'desc' ? desc(tickets.status) : tickets.status;
        break;
      case 'updatedAt':
        orderBy = sortOrder === 'desc' ? desc(tickets.updatedAt) : tickets.updatedAt;
        break;
      default:
        orderBy = sortOrder === 'desc' ? desc(tickets.createdAt) : tickets.createdAt;
    }

    // Buscar tickets com informações do criador e responsável
    const ticketsList = await storage.db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        type: tickets.type,
        priority: tickets.priority,
        status: tickets.status,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        resolvedAt: tickets.resolvedAt,
        closedAt: tickets.closedAt,
        tags: tickets.tags,
        category: tickets.category,
        isPublic: tickets.isPublic,
        allowComments: tickets.allowComments,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photo: users.photo
        },
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photo: users.photo
        }
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.createdBy, users.id))
      .leftJoin(users, eq(tickets.assignedTo, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(Number(limit))
      .offset(offset);

    // Contar total de tickets
    const totalCount = await storage.db
      .select({ count: sql<number>`count(*)` })
      .from(tickets)
      .where(whereClause);

    res.json({
      tickets: ticketsList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tickets/:id - Buscar ticket específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    const ticket = await storage.db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        type: tickets.type,
        priority: tickets.priority,
        status: tickets.status,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        resolvedAt: tickets.resolvedAt,
        closedAt: tickets.closedAt,
        tags: tickets.tags,
        category: tickets.category,
        isPublic: tickets.isPublic,
        allowComments: tickets.allowComments,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photo: users.photo
        },
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photo: users.photo
        }
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.createdBy, users.id))
      .leftJoin(users, eq(tickets.assignedTo, users.id))
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Verificar permissão
    if (user.role !== 'admin' && 
        ticket[0].creator.id !== user.id && 
        !ticket[0].isPublic) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(ticket[0]);
  } catch (error) {
    console.error('Erro ao buscar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tickets - Criar novo ticket
router.post('/', async (req, res) => {
  try {
    const { user } = req as any;
    const { title, description, type, priority, category, tags, isPublic } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ error: 'Título, descrição e tipo são obrigatórios' });
    }

    const newTicket = await storage.db
      .insert(tickets)
      .values({
        title,
        description,
        type,
        priority: priority || 'medium',
        category,
        tags: tags || [],
        isPublic: isPublic || false,
        createdBy: user.id
      })
      .returning();

    res.status(201).json(newTicket[0]);
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tickets/:id - Atualizar ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const updateData = req.body;

    // Buscar ticket atual
    const currentTicket = await storage.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!currentTicket[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Verificar permissão (apenas criador ou admin pode editar)
    if (user.role !== 'admin' && currentTicket[0].createdBy !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Remover campos que não devem ser atualizados
    delete updateData.id;
    delete updateData.createdBy;
    delete updateData.createdAt;

    const updatedTicket = await storage.db
      .update(tickets)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();

    res.json(updatedTicket[0]);
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/tickets/:id - Deletar ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    // Buscar ticket
    const ticket = await storage.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Verificar permissão (apenas criador ou admin pode deletar)
    if (user.role !== 'admin' && ticket[0].createdBy !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await storage.db
      .delete(tickets)
      .where(eq(tickets.id, id));

    res.json({ message: 'Ticket deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tickets/:id/messages - Buscar mensagens do ticket
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const { page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Verificar se usuário tem acesso ao ticket
    const ticket = await storage.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    if (user.role !== 'admin' && 
        ticket[0].createdBy !== user.id && 
        !ticket[0].isPublic) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar mensagens com informações do autor
    const messages = await storage.db
      .select({
        id: ticketMessages.id,
        content: ticketMessages.content,
        messageType: ticketMessages.messageType,
        systemAction: ticketMessages.systemAction,
        oldValue: ticketMessages.oldValue,
        newValue: ticketMessages.newValue,
        createdAt: ticketMessages.createdAt,
        updatedAt: ticketMessages.updatedAt,
        isEdited: ticketMessages.isEdited,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photo: users.photo
        }
      })
      .from(ticketMessages)
      .leftJoin(users, eq(ticketMessages.authorId, users.id))
      .where(eq(ticketMessages.ticketId, id))
      .orderBy(desc(ticketMessages.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Contar total de mensagens
    const totalCount = await storage.db
      .select({ count: sql<number>`count(*)` })
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, id));

    res.json({
      messages: messages.reverse(), // Ordenar por data de criação (mais antigas primeiro)
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tickets/:id/messages - Criar nova mensagem
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const { content, messageType = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é obrigatório' });
    }

    // Verificar se ticket existe e usuário tem acesso
    const ticket = await storage.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    if (user.role !== 'admin' && 
        ticket[0].createdBy !== user.id && 
        !ticket[0].isPublic) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se comentários são permitidos
    if (!ticket[0].allowComments) {
      return res.status(400).json({ error: 'Comentários não são permitidos neste ticket' });
    }

    const newMessage = await storage.db
      .insert(ticketMessages)
      .values({
        ticketId: id,
        authorId: user.id,
        content,
        messageType
      })
      .returning();

    // Atualizar timestamp do ticket
    await storage.db
      .update(tickets)
      .set({ updatedAt: new Date() })
      .where(eq(tickets.id, id));

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tickets/:id/upload - Upload de arquivo
router.post('/:id/upload', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file as any;
    const { messageId } = req.body; // Opcional, se anexado a uma mensagem específica

    // Verificar se ticket existe e usuário tem acesso
    const ticket = await storage.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    if (user.role !== 'admin' && 
        ticket[0].createdBy !== user.id && 
        !ticket[0].isPublic) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
    }

    // Verificar tipo de arquivo
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `tickets/${id}/${fileName}`;

    // Upload para Supabase Storage - Bucket ENSOS, pasta TICKETS
    const { data, error } = await supabase.storage
      .from('ENSOS')
      .upload(`TICKETS/${filePath}`, file.data, {
        contentType: file.mimetype,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from('ENSOS')
      .getPublicUrl(`TICKETS/${filePath}`);

    // Salvar informações do anexo no banco
    const attachment = await storage.db
      .insert(ticketAttachments)
      .values({
        ticketId: id,
        messageId: messageId || null,
        fileName: file.name,
        fileType: file.mimetype,
        fileSize: file.size,
        fileUrl: urlData.publicUrl,
        uploadedBy: user.id
      })
      .returning();

    res.status(201).json(attachment[0]);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tickets/:id/attachments - Listar anexos do ticket
router.get('/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    // Verificar se ticket existe e usuário tem acesso
    const ticket = await storage.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    if (user.role !== 'admin' && 
        ticket[0].createdBy !== user.id && 
        !ticket[0].isPublic) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const attachments = await storage.db
      .select({
        id: ticketAttachments.id,
        fileName: ticketAttachments.fileName,
        fileType: ticketAttachments.fileType,
        fileSize: ticketAttachments.fileSize,
        fileUrl: ticketAttachments.fileUrl,
        thumbnailUrl: ticketAttachments.thumbnailUrl,
        duration: ticketAttachments.duration,
        width: ticketAttachments.width,
        height: ticketAttachments.height,
        uploadedAt: ticketAttachments.uploadedAt,
        uploader: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photo: users.photo
        }
      })
      .from(ticketAttachments)
      .leftJoin(users, eq(ticketAttachments.uploadedBy, users.id))
      .where(eq(ticketAttachments.ticketId, id))
      .orderBy(desc(ticketAttachments.uploadedAt));

    res.json(attachments);
  } catch (error) {
    console.error('Erro ao buscar anexos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/tickets/:id/attachments/:attachmentId - Deletar anexo
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const { user } = req as any;

    // Buscar anexo
    const attachment = await storage.db
      .select()
      .from(ticketAttachments)
      .where(eq(ticketAttachments.id, attachmentId))
      .limit(1);

    if (!attachment[0]) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    // Verificar se pertence ao ticket correto
    if (attachment[0].ticketId !== id) {
      return res.status(400).json({ error: 'Anexo não pertence a este ticket' });
    }

    // Verificar permissão (apenas uploader ou admin pode deletar)
    if (user.role !== 'admin' && attachment[0].uploadedBy !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Deletar do Supabase Storage - Bucket ENSOS, pasta TICKETS
    const filePath = attachment[0].fileUrl.split('/').pop();
    if (filePath) {
      await supabase.storage
        .from('ENSOS')
        .remove([`TICKETS/tickets/${id}/${filePath}`]);
    }

    // Deletar do banco
    await storage.db
      .delete(ticketAttachments)
      .where(eq(ticketAttachments.id, attachmentId));

    res.json({ message: 'Anexo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar anexo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tickets/stats - Estatísticas dos tickets
router.get('/stats/overview', async (req, res) => {
  try {
    const { user } = req as any;

    // Construir filtros baseados no papel do usuário
    let whereConditions = [];
    
    if (user.role !== 'admin') {
      whereConditions.push(
        or(
          eq(tickets.createdBy, user.id),
          eq(tickets.isPublic, true)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Estatísticas por status
    const statusStats = await storage.db
      .select({
        status: tickets.status,
        count: sql<number>`count(*)`
      })
      .from(tickets)
      .where(whereClause)
      .groupBy(tickets.status);

    // Estatísticas por tipo
    const typeStats = await storage.db
      .select({
        type: tickets.type,
        count: sql<number>`count(*)`
      })
      .from(tickets)
      .where(whereClause)
      .groupBy(tickets.type);

    // Estatísticas por prioridade
    const priorityStats = await storage.db
      .select({
        priority: tickets.priority,
        count: sql<number>`count(*)`
      })
      .from(tickets)
      .where(whereClause)
      .groupBy(tickets.priority);

    // Total de tickets
    const totalCount = await storage.db
      .select({ count: sql<number>`count(*)` })
      .from(tickets)
      .where(whereClause);

    // Tickets criados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCount = await storage.db
      .select({ count: sql<number>`count(*)` })
      .from(tickets)
      .where(
        and(
          whereClause || sql`1=1`,
          sql`${tickets.createdAt} >= ${thirtyDaysAgo}`
        )
      );

    res.json({
      total: totalCount[0].count,
      recent: recentCount[0].count,
      byStatus: statusStats,
      byType: typeStats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
