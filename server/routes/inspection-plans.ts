import { Router } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { inspectionPlans, inspectionPlanRevisions, inspectionPlanProducts } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';

const router = Router();

// Endpoint de teste simples
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API de planos de inspeção funcionando',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Endpoint de teste sem autenticação para debug
router.get('/debug', async (req, res) => {
  try {
    // Verificar se a tabela existe
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `);
    
    res.json({
      message: 'Debug endpoint funcionando',
      timestamp: new Date().toISOString(),
      tableExists: tableCheck[0].exists,
      path: req.path,
      headers: req.headers
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erro no debug endpoint',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proteger todas as rotas com autenticação (exceto /test e /debug)
router.use(authenticateSupabaseToken);

// GET /api/inspection-plans - Listar todos os planos
router.get('/', async (req: any, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('INSPECTION_PLANS', 'GET_PLANS_START', {}, req);
    
    // Verificar se a tabela existe antes de fazer a consulta
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `);
    
    if (!tableCheck[0].exists) {
      logger.warn('INSPECTION_PLANS', 'TABLE_NOT_FOUND', {}, req);
      return res.status(404).json({ 
        message: 'Tabela de planos de inspeção não encontrada',
        error: 'TABLE_NOT_FOUND',
        details: 'A tabela inspection_plans não existe no banco de dados. Execute as migrações.',
        solution: 'Execute: npm run db:migrate'
      });
    }
    
    // Verificar a estrutura da tabela primeiro
    const tableStructure = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'inspection_plans'
      ORDER BY ordinal_position;
    `);
    
    console.log('Estrutura da tabela inspection_plans:', tableStructure);
    
    // Primeiro, tentar com SQL direto para verificar se funciona
    const result = await db.execute(`
      SELECT 
        id,
        plan_code,
        plan_name,
        plan_type,
        version,
        status,
        product_name,
        business_unit,
        inspection_type,
        created_by,
        approved_by,
        approved_at,
        observations,
        special_instructions,
        is_active,
        created_at,
        updated_at
      FROM inspection_plans 
      ORDER BY created_at DESC
    `);
    
    const duration = Date.now() - startTime;
    logger.crud('INSPECTION_PLANS', {
      operation: 'LIST',
      entity: 'inspection_plans',
      result: { count: result.length },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'GET_PLANS', duration, { count: result.length }, req);
    
    res.json(result);
  } catch (error: any) {
    logger.error('INSPECTION_PLANS', 'GET_PLANS_ERROR', error, {}, req);
    
    // Log detalhado do erro
    console.error('Erro detalhado ao buscar planos:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Verificar se é erro de tabela não existente
    if (error.code === '42P01') {
      logger.warn('INSPECTION_PLANS', 'TABLE_NOT_FOUND', { error: error.message }, req);
      return res.status(404).json({ 
        message: 'Tabela de planos de inspeção não encontrada',
        error: 'TABLE_NOT_FOUND',
        details: 'A tabela inspection_plans não existe no banco de dados',
        solution: 'Execute as migrações do banco de dados'
      });
    }
    
    // Verificar se é erro de conexão
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      logger.error('INSPECTION_PLANS', 'DATABASE_CONNECTION_ERROR', { error: error.message }, req);
      return res.status(503).json({ 
        message: 'Serviço de banco de dados indisponível',
        error: 'DATABASE_UNAVAILABLE',
        details: 'Não foi possível conectar ao banco de dados',
        solution: 'Verifique a conexão com o banco de dados'
      });
    }
    
    // Verificar se é erro de schema
    if (error.code === '42703') {
      logger.error('INSPECTION_PLANS', 'SCHEMA_ERROR', { error: error.message }, req);
      return res.status(500).json({ 
        message: 'Erro de estrutura do banco de dados',
        error: 'SCHEMA_ERROR',
        details: 'A estrutura da tabela inspection_plans está incorreta',
        solution: 'Execute as migrações para corrigir a estrutura'
      });
    }
    
    // Verificar se é erro de permissão
    if (error.code === '42501') {
      logger.error('INSPECTION_PLANS', 'PERMISSION_ERROR', { error: error.message }, req);
      return res.status(500).json({ 
        message: 'Erro de permissão no banco de dados',
        error: 'PERMISSION_ERROR',
        details: 'Sem permissão para acessar a tabela inspection_plans',
        solution: 'Verifique as permissões do usuário do banco de dados'
      });
    }
    
    // Erro genérico
    logger.error('INSPECTION_PLANS', 'UNKNOWN_ERROR', { 
      error: error.message, 
      code: error.code,
      stack: error.stack 
    }, req);
    
    res.status(500).json({ 
      message: 'Erro interno ao buscar planos de inspeção',
      error: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
      solution: 'Verifique os logs do servidor para mais detalhes'
    });
  }
});

// GET /api/inspection-plans/product/:productId - Buscar planos por produto
router.get('/product/:productId', authenticateSupabaseToken, async (req: AuthRequest, res) => {
  const { productId } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('INSPECTION_PLANS', 'GET_PLANS_BY_PRODUCT_START', { productId }, req);
    
    const result = await db.select()
      .from(inspectionPlans)
      .where(eq(inspectionPlans.productId, productId))
      .orderBy(desc(inspectionPlans.createdAt));
    
    const duration = Date.now() - startTime;
    logger.crud('INSPECTION_PLANS', {
      operation: 'LIST',
      entity: 'inspection_plans',
      entityId: productId,
      result: { count: result.length },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'GET_PLANS_BY_PRODUCT', duration, { productId, count: result.length }, req);
    
    res.json(result);
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'GET_PLANS_BY_PRODUCT_ERROR', error, { productId }, req);
    res.status(500).json({ message: 'Erro ao buscar planos de inspeção do produto' });
  }
});

// GET /api/inspection-plans/:id - Buscar plano específico
router.get('/:id', authenticateSupabaseToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('INSPECTION_PLANS', 'GET_PLAN_BY_ID_START', { id }, req);
    
    const result = await db.select().from(inspectionPlans).where(eq(inspectionPlans.id, id));
    
    if (result.length === 0) {
      logger.warn('INSPECTION_PLANS', 'GET_PLAN_BY_ID_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'Plano de inspeção não encontrado' });
    }
    
    const duration = Date.now() - startTime;
    logger.crud('INSPECTION_PLANS', {
      operation: 'READ',
      entity: 'inspection_plans',
      entityId: id,
      result: { planCode: result[0].planCode, planName: result[0].planName },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'GET_PLAN_BY_ID', duration, { id }, req);
    
    res.json(result[0]);
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'GET_PLAN_BY_ID_ERROR', error, { id }, req);
    res.status(500).json({ message: 'Erro ao buscar plano de inspeção' });
  }
});

// POST /api/inspection-plans - Criar novo plano
router.post('/', async (req: any, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 DADOS RECEBIDOS:', JSON.stringify(req.body, null, 2));
    logger.info('INSPECTION_PLANS', 'DADOS_RECEBIDOS', { body: req.body });
    
    const {
      planCode,
      planName,
      planType,
      version,
      productId,
      productCode,
      productName,
      productFamily,
      businessUnit,
      inspectionType,
      aqlCritical,
      aqlMajor,
      aqlMinor,
      samplingMethod,
      inspectionLevel,
      inspectionSteps,
      checklists,
      requiredParameters,
      requiredPhotos,
      observations,
      specialInstructions
    } = req.body;

    logger.info('INSPECTION_PLANS', 'CREATE_PLAN_START', { 
      planCode, 
      planName, 
      productCode,
      userId: 'system' 
    }, req);

    // Validações básicas
    if (!planCode) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'planCode', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Código do plano é obrigatório' });
    }

    if (!productName) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'productName', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Nome do produto é obrigatório' });
    }

    if (!businessUnit) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'businessUnit', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Unidade de negócio é obrigatória' });
    }

    if (!inspectionType) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'inspectionType', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Tipo de inspeção é obrigatório' });
    }

    if (!samplingMethod) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'samplingMethod', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Método de amostragem é obrigatório' });
    }

    if (!inspectionSteps) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'inspectionSteps', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Etapas de inspeção são obrigatórias' });
    }

    if (!checklists) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'checklists', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Checklists são obrigatórios' });
    }

    if (!requiredParameters) {
      logger.error('INSPECTION_PLANS', 'ERRO_VALIDACAO', { campo: 'requiredParameters', erro: 'Campo obrigatório' });
      return res.status(400).json({ message: 'Parâmetros obrigatórios são obrigatórios' });
    }

    // Verificar se já existe um plano com o mesmo código
    const existingPlan = await db.select()
      .from(inspectionPlans)
      .where(eq(inspectionPlans.planCode, planCode));

    if (existingPlan.length > 0) {
      logger.warn('INSPECTION_PLANS', 'CREATE_PLAN_CODE_EXISTS', { planCode }, req);
      return res.status(409).json({ message: 'Já existe um plano com este código' });
    }

    // Gerar nome automático do plano se não fornecido
    const autoPlanName = planName || `PLANO DE INSPEÇÃO - ${productName}`;

    logger.info('INSPECTION_PLANS', 'DADOS_PARA_INSERCAO', {
      planCode,
      planName: autoPlanName,
      planType,
      version,
      productId,
      productCode,
      productName,
      productFamily,
      businessUnit,
      inspectionType,
      aqlCritical,
      aqlMajor,
      aqlMinor,
      samplingMethod,
      inspectionLevel,
      inspectionSteps,
      checklists,
      requiredParameters,
      requiredPhotos,
      observations,
      specialInstructions
    });

    const result = await db.insert(inspectionPlans).values({
      planCode,
      planName: autoPlanName,
      planType,
      version,
      productId,
      productCode,
      productName,
      productFamily,
      businessUnit,
      inspectionType,
      aqlCritical,
      aqlMajor,
      aqlMinor,
      samplingMethod,
      inspectionLevel,
      inspectionSteps,
      checklists,
      requiredParameters,
      requiredPhotos,
      observations,
      specialInstructions,
      createdBy: req.user?.id || '0ed6d5df-2838-4126-b9e9-cade6d47667a', // ID do usuário autenticado ou admin padrão
      status: 'draft' as const
    }).returning();

    const newPlan = result[0];
    logger.info('INSPECTION_PLANS', 'PLANO_CRIADO', { id: newPlan.id });

    // Log da criação
    await db.insert(inspectionPlanRevisions).values({
      planId: newPlan.id,
      revision: 1,
      action: 'created',
      changedBy: req.user?.id || '0ed6d5df-2838-4126-b9e9-cade6d47667a',
      changes: JSON.stringify({ message: 'Plano criado' })
    });

    const duration = Date.now() - startTime;
    
    logger.crud('INSPECTION_PLANS', {
      operation: 'CREATE',
      entity: 'inspection_plans',
      entityId: newPlan.id,
      changes: { planCode, planName, productCode, businessUnit },
      result: { 
        id: newPlan.id,
        planCode: newPlan.planCode,
        planName: newPlan.planName
      },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'CREATE_PLAN', duration, { id: newPlan.id }, req);

    res.status(201).json(newPlan);
  } catch (error: any) {
    logger.error('INSPECTION_PLANS', 'CREATE_PLAN_ERROR', { 
      error: error?.message || 'Erro desconhecido', 
      stack: error?.stack,
      body: req.body,
      planCode: req.body?.planCode,
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao criar plano de inspeção' });
  }
});

// POST /api/inspection-plans/:id/duplicate - Duplicar plano
router.post('/:id/duplicate', async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const {
      newPlanCode,
      newProductCode,
      newProductName,
      newVoltage,
      modifications = {}
    } = req.body;

    logger.info('INSPECTION_PLANS', 'DUPLICATE_PLAN_START', { 
      id, 
      newPlanCode, 
      newProductCode, 
      newVoltage,
      userId: req.user?.id 
    }, req);

    // Buscar plano original
    const originalPlan = await db.select()
      .from(inspectionPlans)
      .where(eq(inspectionPlans.id, id));

    if (originalPlan.length === 0) {
      logger.warn('INSPECTION_PLANS', 'DUPLICATE_PLAN_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'Plano de inspeção não encontrado' });
    }

    const plan = originalPlan[0];

    // Verificar se o novo código já existe
    if (newPlanCode) {
      const existingPlan = await db.select()
        .from(inspectionPlans)
        .where(eq(inspectionPlans.planCode, newPlanCode));

      if (existingPlan.length > 0) {
        logger.warn('INSPECTION_PLANS', 'DUPLICATE_PLAN_CODE_EXISTS', { newPlanCode }, req);
        return res.status(409).json({ message: 'Já existe um plano com este código' });
      }
    }

    // Preparar dados do novo plano
    const newPlanData = {
      planCode: newPlanCode || `${plan.planCode}-COPY`,
      planName: modifications.planName || `${plan.planName} - Cópia`,
      planType: plan.planType,
      version: 'Rev. 01', // Nova versão
      productId: plan.productId,
      productCode: newProductCode || plan.productCode,
      productName: newProductName || plan.productName,
      productFamily: plan.productFamily,
      businessUnit: plan.businessUnit,
      inspectionType: plan.inspectionType,
      aqlCritical: plan.aqlCritical,
      aqlMajor: plan.aqlMajor,
      aqlMinor: plan.aqlMinor,
      samplingMethod: plan.samplingMethod,
      inspectionLevel: plan.inspectionLevel,
      inspectionSteps: plan.inspectionSteps, // Pode ser modificado
      checklists: plan.checklists, // Pode ser modificado
      requiredParameters: plan.requiredParameters, // Pode ser modificado
      requiredPhotos: plan.requiredPhotos,
      observations: modifications.observations || plan.observations,
      specialInstructions: modifications.specialInstructions || plan.specialInstructions,
      createdBy: req.user?.id || '0ed6d5df-2838-4126-b9e9-cade6d47667a',
      status: 'draft' as const
    };

    // Aplicar modificações específicas para voltagem
    if (newVoltage) {
      let steps = JSON.parse(plan.inspectionSteps || '[]');
      let checklists = JSON.parse(plan.checklists || '[]');
      let parameters = JSON.parse(plan.requiredParameters || '[]');

      // Modificar passos relacionados à voltagem
      steps = steps.map((step: any) => {
        if (step.title && step.title.toLowerCase().includes('voltagem')) {
          return {
            ...step,
            description: step.description?.replace(/127v|220v/gi, newVoltage),
            expectedValue: step.expectedValue?.replace(/127v|220v/gi, newVoltage)
          };
        }
        return step;
      });

      // Modificar checklists relacionados à voltagem
      checklists = checklists.map((checklist: any) => {
        if (checklist.title && checklist.title.toLowerCase().includes('voltagem')) {
          return {
            ...checklist,
            items: checklist.items?.map((item: any) => ({
              ...item,
              description: item.description?.replace(/127v|220v/gi, newVoltage)
            }))
          };
        }
        return checklist;
      });

      // Modificar parâmetros relacionados à voltagem
      parameters = parameters.map((param: any) => {
        if (param.name && param.name.toLowerCase().includes('voltagem')) {
          return {
            ...param,
            value: param.value?.replace(/127v|220v/gi, newVoltage),
            unit: newVoltage
          };
        }
        return param;
      });

      newPlanData.inspectionSteps = JSON.stringify(steps);
      newPlanData.checklists = JSON.stringify(checklists);
      newPlanData.requiredParameters = JSON.stringify(parameters);
    }

    // Criar novo plano
    const result = await db.insert(inspectionPlans).values(newPlanData).returning();
    const newPlan = result[0];

    // Log da duplicação
    await db.insert(inspectionPlanRevisions).values({
      planId: newPlan.id,
      revision: 1,
      action: 'created',
      changedBy: req.user?.id || '0ed6d5df-2838-4126-b9e9-cade6d47667a',
      changes: { 
        message: 'Plano duplicado',
        originalPlanId: id,
        modifications: {
          newVoltage,
          newProductCode,
          newProductName,
          ...modifications
        }
      }
    });

    const duration = Date.now() - startTime;
    
    logger.crud('INSPECTION_PLANS', {
      operation: 'CREATE',
      entity: 'inspection_plans',
      entityId: newPlan.id,
      changes: {
        originalPlanId: id,
        newPlanCode,
        newProductCode,
        newVoltage,
        modifications
      },
      result: { 
        newPlanId: newPlan.id,
        newPlanCode: newPlan.planCode,
        originalPlanId: id
      },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'DUPLICATE_PLAN', duration, { 
      originalId: id, 
      newId: newPlan.id 
    }, req);

    res.status(201).json({
      message: 'Plano duplicado com sucesso',
      newPlan,
      originalPlanId: id
    });
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'DUPLICATE_PLAN_ERROR', error, { 
      planId: id, 
      newPlanCode: newPlanCode, 
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao duplicar plano de inspeção' });
  }
});

// PATCH /api/inspection-plans/:id - Atualizar plano
router.patch('/:id', async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.info('INSPECTION_PLANS', 'UPDATE_PLAN_START', { 
      id, 
      updateData,
      userId: req.user?.id 
    }, req);

    // Buscar plano atual
    const currentPlan = await db.select()
      .from(inspectionPlans)
      .where(eq(inspectionPlans.id, id));

    if (currentPlan.length === 0) {
      logger.warn('INSPECTION_PLANS', 'UPDATE_PLAN_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'Plano de inspeção não encontrado' });
    }

    const plan = currentPlan[0];
    const newVersion = `Rev. ${parseInt(plan.version.replace('Rev. ', '')) + 1}`;

    // Atualizar plano
    const result = await db.update(inspectionPlans)
      .set({
        ...updateData,
        version: newVersion,
        updatedAt: new Date()
      })
      .where(eq(inspectionPlans.id, id))
      .returning();

    const updatedPlan = result[0];

    // Log da atualização
    await db.insert(inspectionPlanRevisions).values({
      planId: id,
      revision: parseInt(plan.version.replace('Rev. ', '')) + 1,
      action: 'updated',
      changedBy: req.user?.id || '0ed6d5df-2838-4126-b9e9-cade6d47667a',
      changes: { 
        message: 'Plano atualizado',
        changes: updateData
      }
    });

    const duration = Date.now() - startTime;
    
    logger.crud('INSPECTION_PLANS', {
      operation: 'UPDATE',
      entity: 'inspection_plans',
      entityId: id,
      changes: updateData,
      result: { 
        id,
        version: newVersion,
        updatedFields: Object.keys(updateData)
      },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'UPDATE_PLAN', duration, { id }, req);

    res.json(updatedPlan);
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'UPDATE_PLAN_ERROR', error, { 
      id, 
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao atualizar plano de inspeção' });
  }
});

// GET /api/inspection-plans/:id/revisions - Buscar histórico de revisões
router.get('/:id/revisions', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    logger.info('INSPECTION_PLANS', 'GET_REVISIONS_START', { id }, req);
    
    const result = await db.select()
      .from(inspectionPlanRevisions)
      .where(eq(inspectionPlanRevisions.planId, id))
      .orderBy(desc(inspectionPlanRevisions.revision));
    
    const duration = Date.now() - startTime;
    
    logger.crud('INSPECTION_PLANS', {
      operation: 'READ',
      entity: 'inspection_plan_revisions',
      entityId: id,
      result: { count: result.length },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'GET_REVISIONS', duration, { id, count: result.length }, req);
    
    res.json(result);
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'GET_REVISIONS_ERROR', error, { id }, req);
    res.status(500).json({ message: 'Erro ao buscar revisões' });
  }
});

// DELETE /api/inspection-plans/:id - Desativar plano (não excluir)
router.delete('/:id', async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    logger.info('INSPECTION_PLANS', 'ARCHIVE_PLAN_START', { 
      id, 
      userId: req.user?.id 
    }, req);
    
    // Em vez de excluir, apenas desativar
    const result = await db.update(inspectionPlans)
      .set({
        status: 'inactive',
        updatedAt: new Date()
      })
      .where(eq(inspectionPlans.id, id))
      .returning();

    if (result.length === 0) {
      logger.warn('INSPECTION_PLANS', 'ARCHIVE_PLAN_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'Plano de inspeção não encontrado' });
    }

    const duration = Date.now() - startTime;
    
    logger.crud('INSPECTION_PLANS', {
      operation: 'UPDATE',
      entity: 'inspection_plans',
      entityId: id,
      changes: { status: 'inactive' },
      result: { 
        id,
        status: 'inactive'
      },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'ARCHIVE_PLAN', duration, { id }, req);

    res.json({ message: 'Plano de inspeção arquivado com sucesso' });
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'ARCHIVE_PLAN_ERROR', error, { 
      id, 
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao arquivar plano de inspeção' });
  }
});

export default router;
