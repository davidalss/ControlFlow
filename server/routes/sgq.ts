import express from 'express';
import { db } from '../db';
import { rncRecords, notifications } from '../../shared/schema';
import { eq, and, desc, count, or } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { AuthRequest } from '../types/severino';

// Middleware para verificar roles usando autenticação Supabase
const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado para esta função' });
    }
    next();
  };
};

const router = express.Router();

// GET /api/sgq/dashboard - Dashboard do SGQ
router.get('/dashboard', requireRole(['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('SGQ', 'DASHBOARD_START', { userId: req.user?.id }, req);
    
    // Buscar estatísticas do dashboard
    const pendingEvaluationResult = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.sgqStatus, 'pending_evaluation'));
    
    const pendingTreatmentResult = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.sgqStatus, 'pending_treatment'));
    
    const closedResult = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.sgqStatus, 'closed'));
    
    const blockedResult = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.lotBlocked, true));
    
    const statistics = {
      pendingEvaluation: pendingEvaluationResult[0]?.count || 0,
      pendingTreatment: pendingTreatmentResult[0]?.count || 0,
      closed: closedResult[0]?.count || 0,
      blocked: blockedResult[0]?.count || 0
    };
    
    const duration = Date.now() - startTime;
    logger.performance('SGQ', 'DASHBOARD', duration, { statistics }, req);
    
    res.json({ statistics });
    
  } catch (error: any) {
    logger.error('SGQ', 'DASHBOARD_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack
    }, req);
    res.status(500).json({ message: 'Erro ao carregar dashboard do SGQ' });
  }
});

// GET /api/sgq/rnc - Listar RNCs para tratamento SGQ
router.get('/rnc', requireRole(['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('SGQ', 'LIST_RNC_FOR_TREATMENT_START', { userId: req.user?.id }, req);
    
    const { page = 1, limit = 20, sgqStatus, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir filtros para RNCs que precisam de tratamento SGQ
    const filters = [
      or(
        eq(rncRecords.sgqStatus, 'pending_evaluation'),
        eq(rncRecords.sgqStatus, 'pending_treatment')
      )
    ];
    
    if (sgqStatus) filters.push(eq(rncRecords.sgqStatus, sgqStatus as string));
    if (type) filters.push(eq(rncRecords.type, type as string));
    
    // Buscar RNCs
    const result = await db.select()
      .from(rncRecords)
      .where(and(...filters))
      .orderBy(desc(rncRecords.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    // Contar total
    const totalResult = await db.select({ count: count() })
      .from(rncRecords)
      .where(and(...filters));
    
    const duration = Date.now() - startTime;
    logger.performance('SGQ', 'LIST_RNC_FOR_TREATMENT', duration, { count: result.length }, req);
    
    res.json({
      rncs: result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalResult[0].count,
        pages: Math.ceil(totalResult[0].count / Number(limit))
      }
    });
    
  } catch (error: any) {
    logger.error('SGQ', 'LIST_RNC_FOR_TREATMENT_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack
    }, req);
    res.status(500).json({ message: 'Erro ao listar RNCs para tratamento' });
  }
});

// GET /api/sgq/rnc/:id - Buscar RNC específica para tratamento
router.get('/rnc/:id', requireRole(['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('SGQ', 'GET_RNC_FOR_TREATMENT_START', { id }, req);
    
    const result = await db.select().from(rncRecords).where(eq(rncRecords.id, id));
    
    if (result.length === 0) {
      logger.warn('SGQ', 'GET_RNC_FOR_TREATMENT_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'RNC não encontrada' });
    }
    
    const duration = Date.now() - startTime;
    logger.performance('SGQ', 'GET_RNC_FOR_TREATMENT', duration, { id }, req);
    
    res.json(result[0]);
    
  } catch (error: any) {
    logger.error('SGQ', 'GET_RNC_FOR_TREATMENT_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack,
      id
    }, req);
    res.status(500).json({ message: 'Erro ao buscar RNC para tratamento' });
  }
});

// PATCH /api/sgq/rnc/:id/treat - Tratar RNC
router.patch('/rnc/:id/treat', requireRole(['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('SGQ', 'TREAT_RNC_START', { id, body: req.body }, req);
    
    const {
      sgqNotes,
      sgqCorrectiveActions,
      sgqAuthorization,
      sgqStatus,
      lotBlocked,
      lotUnblockDate
    } = req.body;
    
    // Buscar RNC atual
    const currentRnc = await db.select().from(rncRecords).where(eq(rncRecords.id, id));
    
    if (currentRnc.length === 0) {
      logger.warn('SGQ', 'TREAT_RNC_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'RNC não encontrada' });
    }
    
    const rnc = currentRnc[0];
    
    // Preparar dados de atualização
    const updateData: any = {
      sgqAssignedTo: req.user!.id,
      sgqAssignedToName: req.user!.name,
      sgqNotes,
      sgqCorrectiveActions,
      sgqAuthorization,
      sgqStatus,
      updatedAt: new Date()
    };
    
    // Se autorizado, desbloquear lote se necessário
    if (sgqAuthorization === 'authorized' && rnc.lotBlocked) {
      updateData.lotBlocked = false;
      updateData.lotUnblockDate = new Date();
      updateData.status = 'closed';
    }
    
    // Se negado, manter bloqueio
    if (sgqAuthorization === 'denied') {
      updateData.lotBlocked = true;
      updateData.lotBlockDate = new Date();
      updateData.status = 'blocked';
    }
    
    // Atualizar RNC
    const result = await db.update(rncRecords)
      .set(updateData)
      .where(eq(rncRecords.id, id))
      .returning();
    
    // Criar notificação para o inspetor
    await db.insert(notifications).values({
      userId: rnc.inspectorId,
      title: `RNC ${rnc.rncCode} Tratada`,
      message: `Sua RNC ${rnc.rncCode} foi ${sgqAuthorization === 'authorized' ? 'autorizada' : 'negada'} pelo SGQ`,
      type: 'sgq',
      priority: sgqAuthorization === 'authorized' ? 'normal' : 'high',
      actionUrl: `/rnc/${id}`,
      relatedId: id
    });
    
    const duration = Date.now() - startTime;
    logger.performance('SGQ', 'TREAT_RNC', duration, { id, authorization: sgqAuthorization }, req);
    
    res.json(result[0]);
    
  } catch (error: any) {
    logger.error('SGQ', 'TREAT_RNC_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack,
      id,
      body: req.body
    }, req);
    res.status(500).json({ message: 'Erro ao tratar RNC' });
  }
});

// GET /api/sgq/dashboard - Dashboard SGQ
router.get('/dashboard', requireRole(['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('SGQ', 'DASHBOARD_START', { userId: req.user?.id }, req);
    
    // Estatísticas por status
    const pendingEvaluation = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.sgqStatus, 'pending_evaluation'));
    
    const pendingTreatment = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.sgqStatus, 'pending_treatment'));
    
    const closed = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.sgqStatus, 'closed'));
    
    const blocked = await db.select({ count: count() })
      .from(rncRecords)
      .where(eq(rncRecords.status, 'blocked'));
    
    // RNCs recentes
    const recentRnc = await db.select()
      .from(rncRecords)
      .where(or(
        eq(rncRecords.sgqStatus, 'pending_evaluation'),
        eq(rncRecords.sgqStatus, 'pending_treatment')
      ))
      .orderBy(desc(rncRecords.createdAt))
      .limit(5);
    
    const duration = Date.now() - startTime;
    logger.performance('SGQ', 'DASHBOARD', duration, {}, req);
    
    res.json({
      statistics: {
        pendingEvaluation: pendingEvaluation[0].count,
        pendingTreatment: pendingTreatment[0].count,
        closed: closed[0].count,
        blocked: blocked[0].count
      },
      recentRnc
    });
    
  } catch (error: any) {
    logger.error('SGQ', 'DASHBOARD_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack
    }, req);
    res.status(500).json({ message: 'Erro ao carregar dashboard SGQ' });
  }
});

// GET /api/sgq/reports - Relatórios SGQ
router.get('/reports', requireRole(['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('SGQ', 'REPORTS_START', { userId: req.user?.id }, req);
    
    const { startDate, endDate, supplier, productCode } = req.query;
    
    // Construir filtros
    const filters = [];
    if (startDate && endDate) {
      filters.push(
        and(
          rncRecords.createdAt >= new Date(startDate as string),
          rncRecords.createdAt <= new Date(endDate as string)
        )
      );
    }
    if (supplier) filters.push(eq(rncRecords.supplier, supplier as string));
    if (productCode) filters.push(eq(rncRecords.productCode, productCode as string));
    
    // Buscar RNCs para relatório
    const result = await db.select()
      .from(rncRecords)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(rncRecords.createdAt));
    
    // Calcular estatísticas
    const totalRnc = result.length;
    const authorizedRnc = result.filter(r => r.sgqAuthorization === 'authorized').length;
    const deniedRnc = result.filter(r => r.sgqAuthorization === 'denied').length;
    const pendingRnc = result.filter(r => r.sgqAuthorization === null).length;
    
    const duration = Date.now() - startTime;
    logger.performance('SGQ', 'REPORTS', duration, { count: result.length }, req);
    
    res.json({
      rncs: result,
      statistics: {
        total: totalRnc,
        authorized: authorizedRnc,
        denied: deniedRnc,
        pending: pendingRnc,
        authorizationRate: totalRnc > 0 ? (authorizedRnc / totalRnc) * 100 : 0
      }
    });
    
  } catch (error: any) {
    logger.error('SGQ', 'REPORTS_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack
    }, req);
    res.status(500).json({ message: 'Erro ao gerar relatórios SGQ' });
  }
});

export default router;
