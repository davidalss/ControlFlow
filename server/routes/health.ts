import { Router } from 'express';
import { db } from '../db';
import { logger } from '../lib/logger';

const router = Router();

// GET /api/health - Health check do servidor
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar conexão com o banco de dados
    const dbCheck = await db.execute('SELECT 1 as health_check');
    
    // Verificar se as tabelas principais existem
    const tablesCheck = await db.execute(`
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
    
    logger.info('HEALTH_CHECK', 'SUCCESS', healthStatus, req);
    
    res.json(healthStatus);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('HEALTH_CHECK', 'FAILED', error, {}, req);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
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

// GET /api/health/db - Health check específico do banco de dados
router.get('/db', async (req, res) => {
  try {
    // Verificar conexão básica
    await db.execute('SELECT 1 as health_check');
    
    // Verificar tabelas importantes
    const tables = await db.execute(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('inspection_plans', 'users', 'products', 'suppliers')
      ORDER BY table_name
    `);
    
    res.json({
      status: 'healthy',
      database: 'connected',
      tables: tables,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
