/**
 * Rotas para logs de testes automatizados
 * GET /api/system-logs - Retorna logs com filtros
 * 
 * Filtros aceitos:
 * - suite: nome da suíte de testes
 * - route: rota específica
 * - status_code: código de status HTTP
 * - passed: true/false
 * - from: data inicial (ISO string)
 * - to: data final (ISO string)
 * - limit: número máximo de registros (padrão: 100)
 */

import { Router } from 'express';
import { getSystemLogs, getSystemLogsStats } from '../lib/supabase-client.js';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticação
router.use(authenticateToken);

// GET /api/system-logs - Obter logs com filtros
router.get('/', async (req, res) => {
  try {
    const {
      suite,
      route,
      status_code,
      passed,
      from,
      to,
      limit = 100
    } = req.query;

    // Validar parâmetros
    const filters = {};
    
    if (suite) filters.suite = suite as string;
    if (route) filters.route = route as string;
    if (status_code) filters.status_code = parseInt(status_code as string);
    if (passed !== undefined) filters.passed = passed === 'true';
    if (from) filters.from = new Date(from as string).toISOString();
    if (to) filters.to = new Date(to as string).toISOString();
    if (limit) filters.limit = parseInt(limit as string);

    // Buscar logs
    const logs = await getSystemLogs(filters);

    res.json({
      success: true,
      data: logs,
      total: logs.length,
      filters: {
        suite,
        route,
        status_code,
        passed,
        from,
        to,
        limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar logs do sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/system-logs/stats - Obter estatísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await getSystemLogsStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/system-logs/export - Exportar logs em CSV
router.get('/export', async (req, res) => {
  try {
    const {
      suite,
      route,
      status_code,
      passed,
      from,
      to,
      format = 'csv'
    } = req.query;

    // Buscar logs
    const filters = {};
    if (suite) filters.suite = suite as string;
    if (route) filters.route = route as string;
    if (status_code) filters.status_code = parseInt(status_code as string);
    if (passed !== undefined) filters.passed = passed === 'true';
    if (from) filters.from = new Date(from as string).toISOString();
    if (to) filters.to = new Date(to as string).toISOString();
    filters.limit = 1000; // Exportar mais registros

    const logs = await getSystemLogs(filters);

    if (format === 'csv') {
      // Gerar CSV
      const csvHeader = 'Data/Hora,Suite,Teste,Rota,Status,Tempo(ms),CORS,Resultado,Erro,Meta\n';
      const csvData = logs.map(log => {
        const timestamp = new Date(log.created_at).toLocaleString('pt-BR');
        const meta = log.meta ? JSON.stringify(log.meta).replace(/"/g, '""') : '';
        const error = log.error_message ? log.error_message.replace(/"/g, '""') : '';
        
        return `"${timestamp}","${log.test_suite}","${log.test_name}","${log.route}","${log.status_code}","${log.response_time_ms}","${log.cors_ok}","${log.passed}","${error}","${meta}"`;
      }).join('\n');

      const csvContent = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Retornar JSON
      res.json({
        success: true,
        data: logs,
        total: logs.length,
        format: 'json',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Erro ao exportar logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/system-logs/suites - Listar suítes disponíveis
router.get('/suites', async (req, res) => {
  try {
    const logs = await getSystemLogs({ limit: 1000 });
    
    // Extrair suítes únicas
    const suites = [...new Set(logs.map(log => log.test_suite))].sort();
    
    res.json({
      success: true,
      data: suites,
      total: suites.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar suítes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/system-logs/routes - Listar rotas disponíveis
router.get('/routes', async (req, res) => {
  try {
    const logs = await getSystemLogs({ limit: 1000 });
    
    // Extrair rotas únicas
    const routes = [...new Set(logs.map(log => log.route))].sort();
    
    res.json({
      success: true,
      data: routes,
      total: routes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar rotas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
