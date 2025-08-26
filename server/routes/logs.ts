import { Router } from 'express';
import { logger } from '../lib/logger';
import { db } from '../lib/database';
import { logs } from '../../shared/schema';
import { desc, eq, and, gte, lte, like, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/logs - Obter logs do sistema
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const level = req.query.level as string;
    const module = req.query.module as string;
    const operation = req.query.operation as string;
    const userId = req.query.userId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    // Construir condições de filtro
    const conditions = [];
    
    if (level) {
      conditions.push(eq(logs.actionType, level.toUpperCase()));
    }
    
    if (module) {
      conditions.push(like(logs.actionType, `%${module}%`));
    }
    
    if (operation) {
      conditions.push(like(logs.description, `%${operation}%`));
    }
    
    if (userId) {
      conditions.push(eq(logs.userId, userId));
    }
    
    if (startDate) {
      conditions.push(gte(logs.timestamp, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(logs.timestamp, new Date(endDate)));
    }
    
    // Buscar logs do banco de dados
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const dbLogs = await db
      .select()
      .from(logs)
      .where(whereClause)
      .orderBy(desc(logs.timestamp))
      .limit(limit);
    
    // Converter para formato esperado pelo frontend
    const formattedLogs = dbLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      level: log.actionType,
      module: log.actionType.split('_')[0] || 'SYSTEM',
      operation: log.actionType,
      description: log.description,
      details: log.details ? JSON.parse(log.details) : null,
      userId: log.userId,
      userName: log.userName,
      correlationId: log.id.slice(0, 8),
      duration: null,
      status: null
    }));
    
    res.json({
      logs: formattedLogs,
      total: formattedLogs.length,
      filters: {
        level,
        module,
        operation,
        userId,
        startDate,
        endDate,
        limit
      }
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar logs',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/logs/stats - Estatísticas dos logs
router.get('/stats', async (req, res) => {
  try {
    const logs = logger.getLogs(1000); // Últimos 1000 logs
    
    // Calcular estatísticas das últimas 24 horas
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const logs24h = logs.filter(log => new Date(log.timestamp) >= last24h);
    const errors24h = logs24h.filter(log => log.level === 'ERROR').length;
    const warnings24h = logs24h.filter(log => log.level === 'WARNING').length;
    
    // Calcular tempo médio de resposta
    const performanceLogs = logs.filter(log => log.details?.duration);
    const avgResponseTime = performanceLogs.length > 0 
      ? performanceLogs.reduce((sum, log) => sum + (log.details?.duration || 0), 0) / performanceLogs.length
      : 0;
    
    const stats = {
      total: logs.length,
      byLevel: {} as Record<string, number>,
      byModule: {} as Record<string, number>,
      byOperation: {} as Record<string, number>,
      errorsLast24h: errors24h,
      warningsLast24h: warnings24h,
      avgResponseTime: avgResponseTime
    };
    
    // Contar por nível
    logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });
    
    // Contar por módulo
    logs.forEach(log => {
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
    });
    
    // Contar por operação
    logs.forEach(log => {
      const operation = log.operation.split('_')[0]; // Pegar apenas a primeira parte da operação
      stats.byOperation[operation] = (stats.byOperation[operation] || 0) + 1;
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos logs:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas dos logs',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/logs/defects - Logs de defeitos específicos
router.get('/defects', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Buscar logs de erro e warning do banco
    const defectLogs = await db
      .select()
      .from(logs)
      .where(
        and(
          sql`${logs.actionType} IN ('ERROR', 'WARNING', 'CRITICAL')`,
          like(logs.description, '%defect%')
        )
      )
      .orderBy(desc(logs.timestamp))
      .limit(limit);
    
    const formattedLogs = defectLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      level: log.actionType,
      module: log.actionType.split('_')[0] || 'SYSTEM',
      operation: log.actionType,
      description: log.description,
      details: log.details ? JSON.parse(log.details) : null,
      userId: log.userId,
      userName: log.userName,
      correlationId: log.id.slice(0, 8),
      duration: null,
      status: null
    }));
    
    res.json({
      logs: formattedLogs,
      total: formattedLogs.length
    });
  } catch (error) {
    console.error('Erro ao buscar logs de defeitos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar logs de defeitos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/logs/audit - Logs de auditoria
router.get('/audit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const userId = req.query.userId as string;
    
    const conditions = [
      like(logs.actionType, '%AUDIT%')
    ];
    
    if (userId) {
      conditions.push(eq(logs.userId, userId));
    }
    
    const auditLogs = await db
      .select()
      .from(logs)
      .where(and(...conditions))
      .orderBy(desc(logs.timestamp))
      .limit(limit);
    
    const formattedLogs = auditLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      level: log.actionType,
      module: 'AUDIT',
      operation: log.actionType,
      description: log.description,
      details: log.details ? JSON.parse(log.details) : null,
      userId: log.userId,
      userName: log.userName,
      correlationId: log.id.slice(0, 8),
      duration: null,
      status: null
    }));
    
    res.json({
      logs: formattedLogs,
      total: formattedLogs.length
    });
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar logs de auditoria',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/logs - Criar novo log
router.post('/', async (req, res) => {
  try {
    const { level, module, operation, description, details, userId, userName, ipAddress, userAgent } = req.body;
    
    if (!level || !module || !operation || !description) {
      return res.status(400).json({
        error: 'Campos obrigatórios: level, module, operation, description'
      });
    }
    
    const newLog = await db.insert(logs).values({
      actionType: level,
      description: `${module}_${operation}: ${description}`,
      details: details ? JSON.stringify(details) : null,
      userId: userId || req.user?.id,
      userName: userName || req.user?.name || 'Sistema'
    }).returning();
    
    // Também adicionar ao logger em memória
    logger.info(module, operation, {
      ...details,
      userId: newLog[0].userId,
      userName: newLog[0].userName,
      ipAddress,
      userAgent
    });
    
    res.status(201).json({
      message: 'Log criado com sucesso',
      log: newLog[0]
    });
  } catch (error) {
    console.error('Erro ao criar log:', error);
    res.status(500).json({ 
      error: 'Erro ao criar log',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/logs/clear - Limpar logs antigos
router.delete('/clear', async (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days as string) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // Deletar logs antigos do banco
    const result = await db
      .delete(logs)
      .where(lte(logs.timestamp, cutoffDate));
    
    // Limpar logs em memória
    logger.clearLogs();
    
    res.json({ 
      message: 'Logs antigos removidos com sucesso',
      deletedCount: 'logs removidos',
      cutoffDate: cutoffDate.toISOString()
    });
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
    res.status(500).json({ 
      error: 'Erro ao limpar logs antigos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/logs/export - Exportar logs
router.get('/export', async (req, res) => {
  try {
    const format = req.query.format as string || 'csv';
    const level = req.query.level as string;
    const module = req.query.module as string;
    const operation = req.query.operation as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    // Construir condições de filtro
    const conditions = [];
    
    if (level) {
      conditions.push(eq(logs.actionType, level.toUpperCase()));
    }
    
    if (module) {
      conditions.push(like(logs.actionType, `%${module}%`));
    }
    
    if (operation) {
      conditions.push(like(logs.description, `%${operation}%`));
    }
    
    if (startDate) {
      conditions.push(gte(logs.timestamp, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(logs.timestamp, new Date(endDate)));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const exportLogs = await db
      .select()
      .from(logs)
      .where(whereClause)
      .orderBy(desc(logs.timestamp));
    
    if (format === 'csv') {
      const csvHeader = 'Timestamp,Level,Module,Operation,Description,User,Details\n';
      const csvData = exportLogs.map(log => {
        const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
        return `"${log.timestamp}","${log.actionType}","${log.actionType.split('_')[0]}","${log.actionType}","${log.description.replace(/"/g, '""')}","${log.userName}","${details}"`;
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json({
        logs: exportLogs,
        total: exportLogs.length,
        format
      });
    }
  } catch (error) {
    console.error('Erro ao exportar logs:', error);
    res.status(500).json({ 
      error: 'Erro ao exportar logs',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/logs - Limpar todos os logs (deprecated, usar /clear)
router.delete('/', async (req, res) => {
  try {
    logger.clearLogs();
    res.json({ message: 'Logs limpos com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
    res.status(500).json({ 
      error: 'Erro ao limpar logs',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;
