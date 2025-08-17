import express from 'express';
import { db } from '../db';
import { rncRecords, rncHistory, notifications } from '../../shared/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { requireRole } from '../middleware/auth';
import { AuthRequest } from '../types/severino';

const router = express.Router();

// GET /api/rnc - Listar RNCs
router.get('/', requireRole(['admin', 'inspector', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('RNC', 'LIST_RNC_START', { userId: req.user?.id }, req);
    
    const { page = 1, limit = 20, status, type, supplier } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const filters = [];
    if (status) filters.push(eq(rncRecords.status, status as string));
    if (type) filters.push(eq(rncRecords.type, type as string));
    if (supplier) filters.push(eq(rncRecords.supplier, supplier as string));
    
    // Buscar RNCs
    const result = await db.select()
      .from(rncRecords)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(rncRecords.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    // Contar total
    const totalResult = await db.select({ count: count() })
      .from(rncRecords)
      .where(filters.length > 0 ? and(...filters) : undefined);
    
    const duration = Date.now() - startTime;
    logger.performance('RNC', 'LIST_RNC', duration, { count: result.length }, req);
    
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
    logger.error('RNC', 'LIST_RNC_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack
    }, req);
    res.status(500).json({ message: 'Erro ao listar RNCs' });
  }
});

// GET /api/rnc/:id - Buscar RNC específica
router.get('/:id', requireRole(['admin', 'inspector', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('RNC', 'GET_RNC_BY_ID_START', { id }, req);
    
    const result = await db.select().from(rncRecords).where(eq(rncRecords.id, id));
    
    if (result.length === 0) {
      logger.warn('RNC', 'GET_RNC_BY_ID_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'RNC não encontrada' });
    }
    
    const duration = Date.now() - startTime;
    logger.performance('RNC', 'GET_RNC_BY_ID', duration, { id }, req);
    
    res.json(result[0]);
    
  } catch (error: any) {
    logger.error('RNC', 'GET_RNC_BY_ID_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack,
      id
    }, req);
    res.status(500).json({ message: 'Erro ao buscar RNC' });
  }
});

// POST /api/rnc - Criar RNC
router.post('/', requireRole(['admin', 'inspector', 'coordenador']), async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('RNC', 'CREATE_RNC_START', { body: req.body }, req);
    
    const {
      inspectionId,
      supplier,
      fresNf,
      productCode,
      productName,
      lotSize,
      inspectionDate,
      inspectedQuantity,
      totalNonConformities,
      defectDetails,
      evidencePhotos,
      containmentMeasures,
      type
    } = req.body;
    
    // Validar dados obrigatórios
    if (!inspectionId || !supplier || !fresNf || !productCode || !productName) {
      logger.error('RNC', 'CREATE_RNC_VALIDATION_ERROR', { 
        missing: !inspectionId ? 'inspectionId' : !supplier ? 'supplier' : !fresNf ? 'fresNf' : !productCode ? 'productCode' : 'productName' 
      }, req);
      return res.status(400).json({ message: 'Dados obrigatórios não fornecidos' });
    }
    
    // Gerar código da RNC
    const rncCode = `RNC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Verificar reincidência
    const historyResult = await db.select()
      .from(rncHistory)
      .where(and(
        eq(rncHistory.productId, productCode),
        eq(rncHistory.supplier, supplier)
      ))
      .orderBy(desc(rncHistory.date));
    
    const isRecurring = historyResult.length > 0;
    const previousRncCount = historyResult.length;
    
    // Criar RNC
    const newRnc = {
      rncCode,
      inspectionId,
      date: new Date(),
      inspectorId: req.user!.id,
      inspectorName: req.user!.name,
      supplier,
      fresNf,
      productCode,
      productName,
      lotSize,
      inspectionDate: new Date(inspectionDate),
      inspectedQuantity,
      totalNonConformities,
      isRecurring,
      previousRncCount,
      defectDetails,
      evidencePhotos,
      containmentMeasures,
      type,
      status: 'pending',
      sgqStatus: 'pending_evaluation',
      lotBlocked: type === 'corrective_action'
    };
    
    const result = await db.insert(rncRecords).values(newRnc).returning();
    
    // Adicionar ao histórico
    if (defectDetails && Array.isArray(defectDetails)) {
      for (const defect of defectDetails) {
        await db.insert(rncHistory).values({
          productId: productCode,
          supplier,
          rncId: result[0].id,
          date: new Date(),
          defectType: defect.type,
          defectCount: defect.count,
          status: 'pending'
        });
      }
    }
    
    // Criar notificação para SGQ
    await db.insert(notifications).values({
      userId: 'sgq_system', // Notificação para o sistema SGQ
      title: `Nova RNC Criada: ${rncCode}`,
      message: `RNC ${rncCode} criada para ${productName} do fornecedor ${supplier}`,
      type: 'rnc',
      priority: 'high',
      actionUrl: `/rnc/${result[0].id}`,
      relatedId: result[0].id
    });
    
    const duration = Date.now() - startTime;
    logger.performance('RNC', 'CREATE_RNC', duration, { rncId: result[0].id }, req);
    
    res.status(201).json(result[0]);
    
  } catch (error: any) {
    logger.error('RNC', 'CREATE_RNC_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack,
      body: req.body
    }, req);
    res.status(500).json({ message: 'Erro ao criar RNC' });
  }
});

// PATCH /api/rnc/:id - Atualizar RNC
router.patch('/:id', requireRole(['admin', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('RNC', 'UPDATE_RNC_START', { id, body: req.body }, req);
    
    const result = await db.update(rncRecords)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(rncRecords.id, id))
      .returning();
    
    if (result.length === 0) {
      logger.warn('RNC', 'UPDATE_RNC_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'RNC não encontrada' });
    }
    
    const duration = Date.now() - startTime;
    logger.performance('RNC', 'UPDATE_RNC', duration, { id }, req);
    
    res.json(result[0]);
    
  } catch (error: any) {
    logger.error('RNC', 'UPDATE_RNC_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack,
      id,
      body: req.body
    }, req);
    res.status(500).json({ message: 'Erro ao atualizar RNC' });
  }
});

// GET /api/rnc/history/:productId - Histórico de RNCs por produto
router.get('/history/:productId', requireRole(['admin', 'inspector', 'coordenador', 'analista', 'assistente', 'lider', 'supervisor', 'manager']), async (req: AuthRequest, res) => {
  const { productId } = req.params;
  const { supplier } = req.query;
  const startTime = Date.now();
  
  try {
    logger.info('RNC', 'GET_HISTORY_START', { productId, supplier }, req);
    
    const filters = [eq(rncHistory.productId, productId)];
    if (supplier) filters.push(eq(rncHistory.supplier, supplier as string));
    
    const result = await db.select()
      .from(rncHistory)
      .where(and(...filters))
      .orderBy(desc(rncHistory.date));
    
    const duration = Date.now() - startTime;
    logger.performance('RNC', 'GET_HISTORY', duration, { productId, count: result.length }, req);
    
    res.json(result);
    
  } catch (error: any) {
    logger.error('RNC', 'GET_HISTORY_ERROR', {
      error: error?.message || 'Erro desconhecido',
      stack: error?.stack,
      productId
    }, req);
    res.status(500).json({ message: 'Erro ao buscar histórico de RNCs' });
  }
});

export default router;
