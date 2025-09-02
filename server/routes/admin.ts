import { Router, Request, Response } from 'express';
import { healthMonitor } from '../lib/health-monitor';
import { securityManager } from '../lib/security-manager';
import { cacheManager } from '../lib/cache-manager';
import { backupManager } from '../lib/backup-manager';
import { logger } from '../lib/logger';

const router = Router();

// Middleware de autenticação para rotas administrativas
const requireAdmin = (req: Request, res: Response, next: Function) => {
  // Aqui você implementaria verificação de admin
  // Por enquanto, permitir acesso
  next();
};

/**
 * @route GET /api/admin/health
 * @desc Obter status de saúde do sistema
 * @access Admin
 */
router.get('/health', requireAdmin, async (req: Request, res: Response) => {
  try {
    const healthStatus = healthMonitor.getHealthStatus();
    const alerts = healthMonitor.getAlerts();
    const metrics = healthMonitor.getMetrics();
    
    res.json({
      success: true,
      data: {
        health: healthStatus,
        alerts: alerts.slice(-10), // Últimos 10 alertas
        metrics: metrics.slice(-50), // Últimas 50 métricas
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao obter status de saúde', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/admin/health/check
 * @desc Forçar verificação de saúde do sistema
 * @access Admin
 */
router.post('/health/check', requireAdmin, async (req: Request, res: Response) => {
  try {
    const healthStatus = await healthMonitor.forceHealthCheck();
    
    res.json({
      success: true,
      data: {
        health: healthStatus,
        message: 'Verificação de saúde forçada com sucesso',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao forçar verificação de saúde', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route GET /api/admin/security
 * @desc Obter estatísticas de segurança
 * @access Admin
 */
router.get('/security', requireAdmin, async (req: Request, res: Response) => {
  try {
    const events = securityManager.getSecurityEvents(100);
    const stats = securityManager.getSecurityStats();
    
    res.json({
      success: true,
      data: {
        events: events.slice(-20), // Últimos 20 eventos
        stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao obter estatísticas de segurança', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/admin/security/unblock/:ip
 * @desc Desbloquear IP
 * @access Admin
 */
router.post('/security/unblock/:ip', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { ip } = req.params;
    const wasBlocked = securityManager.unblockIP(ip);
    
    if (wasBlocked) {
      logger.info('AdminRoutes', 'IP desbloqueado por admin', { ip, adminId: (req as any).user?.id });
      
      res.json({
        success: true,
        data: {
          message: `IP ${ip} desbloqueado com sucesso`,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'IP não estava bloqueado'
      });
    }
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao desbloquear IP', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route GET /api/admin/cache
 * @desc Obter estatísticas do cache
 * @access Admin
 */
router.get('/cache', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = cacheManager.getStats();
    const debugInfo = cacheManager.getDebugInfo();
    
    res.json({
      success: true,
      data: {
        stats,
        debug: {
          cacheSize: debugInfo.cacheSize,
          cacheKeys: debugInfo.cacheKeys.slice(0, 50), // Primeiras 50 chaves
          entries: debugInfo.entries.slice(0, 20) // Primeiras 20 entradas
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao obter estatísticas do cache', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/admin/cache/clear
 * @desc Limpar cache
 * @access Admin
 */
router.post('/cache/clear', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { tags } = req.body;
    
    if (tags && Array.isArray(tags)) {
      const clearedCount = cacheManager.clearByTags(tags);
      logger.info('AdminRoutes', 'Cache limpo por tags', { tags, clearedCount, adminId: (req as any).user?.id });
      
      res.json({
        success: true,
        data: {
          message: `Cache limpo com sucesso. ${clearedCount} entradas removidas.`,
          clearedCount,
          tags,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      cacheManager.clear();
      logger.info('AdminRoutes', 'Cache completamente limpo', { adminId: (req as any).user?.id });
      
      res.json({
        success: true,
        data: {
          message: 'Cache completamente limpo com sucesso',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao limpar cache', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route GET /api/admin/backup
 * @desc Obter informações de backup
 * @access Admin
 */
router.get('/backup', requireAdmin, async (req: Request, res: Response) => {
  try {
    const backups = backupManager.listBackups();
    const stats = backupManager.getBackupStats();
    
    res.json({
      success: true,
      data: {
        backups: backups.slice(0, 20), // Primeiros 20 backups
        stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao obter informações de backup', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/admin/backup/create
 * @desc Criar backup manual
 * @access Admin
 */
router.post('/backup/create', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type = 'FULL' } = req.body;
    
    if (!['FULL', 'INCREMENTAL', 'DATABASE_ONLY'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de backup inválido'
      });
    }
    
    const backup = await backupManager.createBackup(type as any);
    
    logger.info('AdminRoutes', 'Backup manual criado', { 
      type, 
      backupId: backup.id, 
      adminId: (req as any).user?.id 
    });
    
    res.json({
      success: true,
      data: {
        backup,
        message: `Backup ${type} iniciado com sucesso`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao criar backup', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/admin/backup/:id/restore
 * @desc Restaurar backup
 * @access Admin
 */
router.post('/backup/:id/restore', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const restore = await backupManager.restoreBackup(id);
    
    logger.info('AdminRoutes', 'Restauração de backup iniciada', { 
      backupId: id, 
      restoreId: restore.id, 
      adminId: (req as any).user?.id 
    });
    
    res.json({
      success: true,
      data: {
        restore,
        message: 'Restauração iniciada com sucesso',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao restaurar backup', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route DELETE /api/admin/backup/:id
 * @desc Remover backup
 * @access Admin
 */
router.delete('/backup/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const removed = await backupManager.removeBackup(id);
    
    if (removed) {
      logger.info('AdminRoutes', 'Backup removido', { 
        backupId: id, 
        adminId: (req as any).user?.id 
      });
      
      res.json({
        success: true,
        data: {
          message: 'Backup removido com sucesso',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Backup não encontrado'
      });
    }
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao remover backup', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route GET /api/admin/system
 * @desc Obter informações gerais do sistema
 * @access Admin
 */
router.get('/system', requireAdmin, async (req: Request, res: Response) => {
  try {
    const health = healthMonitor.getHealthStatus();
    const securityStats = securityManager.getSecurityStats();
    const cacheStats = cacheManager.getStats();
    const backupStats = backupManager.getBackupStats();
    
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      title: process.title
    };
    
    res.json({
      success: true,
      data: {
        system: systemInfo,
        health,
        security: securityStats,
        cache: cacheStats,
        backup: backupStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao obter informações do sistema', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * @route POST /api/admin/system/restart
 * @desc Reiniciar sistemas (soft restart)
 * @access Admin
 */
router.post('/system/restart', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { systems = [] } = req.body;
    
    const results: any = {};
    
    if (systems.includes('cache') || systems.length === 0) {
      cacheManager.clear();
      results.cache = 'Cache limpo com sucesso';
    }
    
    if (systems.includes('health') || systems.length === 0) {
      await healthMonitor.forceHealthCheck();
      results.health = 'Health check executado com sucesso';
    }
    
    logger.info('AdminRoutes', 'Sistemas reiniciados', { 
      systems, 
      adminId: (req as any).user?.id 
    });
    
    res.json({
      success: true,
      data: {
        message: 'Sistemas reiniciados com sucesso',
        results,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AdminRoutes', 'Erro ao reiniciar sistemas', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;
