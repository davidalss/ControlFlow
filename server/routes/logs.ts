import { Router } from 'express';
import { logger } from '../lib/logger';

const router = Router();

// GET /api/logs - Obter logs do sistema
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const level = req.query.level as string;
    const module = req.query.module as string;
    const operation = req.query.operation as string;
    
    let logs = logger.getLogs(limit);
    
    // Filtrar por nível
    if (level) {
      logs = logs.filter(log => log.level === level.toUpperCase());
    }
    
    // Filtrar por módulo
    if (module) {
      logs = logs.filter(log => log.module.toLowerCase().includes(module.toLowerCase()));
    }
    
    // Filtrar por operação
    if (operation) {
      logs = logs.filter(log => log.operation.toLowerCase().includes(operation.toLowerCase()));
    }
    
    res.json({
      logs,
      total: logs.length,
      filters: {
        level,
        module,
        operation,
        limit
      }
    });
  } catch (error) {
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
    
    const stats = {
      total: logs.length,
      byLevel: {} as Record<string, number>,
      byModule: {} as Record<string, number>,
      byOperation: {} as Record<string, number>,
      recentErrors: logs.filter(log => log.level === 'ERROR').slice(0, 10),
      recentWarnings: logs.filter(log => log.level === 'WARN').slice(0, 10),
      performance: logs.filter(log => log.details?.performance).slice(0, 10)
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
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas dos logs',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/logs - Limpar logs
router.delete('/', async (req, res) => {
  try {
    logger.clearLogs();
    res.json({ message: 'Logs limpos com sucesso' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao limpar logs',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;
