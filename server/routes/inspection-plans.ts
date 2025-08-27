import { Router } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { inspectionPlans, inspectionPlanRevisions, inspectionPlanProducts } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';

const router = Router();

// Função para filtrar apenas alterações relevantes
function filterRelevantChanges(updateData: any) {
  const relevantFields = [
    'planName',
    'planType', 
    'productName',
    'productCode',
    'businessUnit',
    'inspectionType',
    'aqlCritical',
    'aqlMajor', 
    'aqlMinor',
    'samplingMethod',
    'inspectionLevel',
    'inspectionSteps',
    'checklists',
    'requiredParameters',
    'observations',
    'specialInstructions',
    'status'
  ];

  const filteredChanges: any = {};
  
  for (const [key, value] of Object.entries(updateData)) {
    if (relevantFields.includes(key)) {
      // Para campos JSON, mostrar apenas se houve mudança real
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            filteredChanges[key] = `${parsed.length} itens`;
          } else if (typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            filteredChanges[key] = 'Configurado';
          }
        } catch {
          filteredChanges[key] = value;
        }
      } else {
        filteredChanges[key] = value;
      }
    }
  }

  return filteredChanges;
}

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

// Endpoint de teste para DELETE sem autenticação
router.delete('/debug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Testando DELETE para ID:', id);
    
    // Verificar se o registro existe
    const recordExists = await db.execute(`
      SELECT id FROM inspection_plans WHERE id = $1
    `, [id]);
    
    console.log('📋 Registro existe:', recordExists.length > 0);
    
    if (recordExists.length === 0) {
      return res.status(404).json({ 
        message: 'Registro não encontrado',
        id: id
      });
    }
    
    // Tentar fazer o UPDATE (não DELETE)
    const result = await db.execute(`
      UPDATE inspection_plans 
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `, [id]);
    
    console.log('✅ Operação UPDATE realizada:', result[0]);
    
    res.json({ 
      message: 'Operação realizada com sucesso',
      result: result[0]
    });
  } catch (error: any) {
    console.error('❌ Erro no DELETE debug:', error);
    res.status(500).json({
      message: 'Erro no DELETE debug',
      error: error.message,
      stack: error.stack
    });
  }
});

// Middleware de autenticação será aplicado individualmente nas rotas que precisam

// GET /api/inspection-plans - Listar todos os planos
router.get('/', async (req: any, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('INSPECTION_PLANS', 'GET_PLANS_START', {});
    
    // Verificar se a tabela existe antes de fazer a consulta
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `);
    
    if (!tableCheck[0].exists) {
      logger.warn('INSPECTION_PLANS', 'TABLE_NOT_FOUND', {});
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
        plan_code as "planCode",
        plan_name as "planName",
        plan_type as "planType",
        version,
        status,
        product_id as "productId",
        product_code as "productCode",
        product_name as "productName",
        product_family as "productFamily",
        business_unit as "businessUnit",
        inspection_type as "inspectionType",
        aql_critical as "aqlCritical",
        aql_major as "aqlMajor",
        aql_minor as "aqlMinor",
        sampling_method as "samplingMethod",
        inspection_level as "inspectionLevel",
        inspection_steps as "inspectionSteps",
        checklists,
        required_parameters as "requiredParameters",
        required_photos as "requiredPhotos",
        label_file as "labelFile",
        manual_file as "manualFile",
        packaging_file as "packagingFile",
        artwork_file as "artworkFile",
        additional_files as "additionalFiles",
        created_by as "createdBy",
        approved_by as "approvedBy",
        approved_at as "approvedAt",
        observations,
        special_instructions as "specialInstructions",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
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
router.get('/product/:productId', async (req: any, res) => {
  const { productId } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('INSPECTION_PLANS', 'GET_PLANS_BY_PRODUCT_START', { productId });
    
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
router.get('/:id', async (req: any, res) => {
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
    const planData = req.body;
    
    logger.info('INSPECTION_PLANS', 'CREATE_PLAN_START', { 
      planName: planData.planName,
      productId: planData.productId,
      userId: req.user?.id 
    }, req);

    // VALIDAÇÃO: Verificar se já existe um plano para este produto
    const existingPlan = await db.select()
      .from(inspectionPlans)
      .where(eq(inspectionPlans.productId, planData.productId))
      .limit(1);

    if (existingPlan.length > 0) {
      logger.warn('INSPECTION_PLANS', 'CREATE_PLAN_DUPLICATE_PRODUCT', { 
        productId: planData.productId,
        existingPlanId: existingPlan[0].id,
        userId: req.user?.id 
      }, req);
      
      return res.status(409).json({ 
        message: 'Já existe um plano de inspeção para este produto',
        existingPlan: {
          id: existingPlan[0].id,
          planName: existingPlan[0].planName,
          planCode: existingPlan[0].planCode
        }
      });
    }

    // Se não existe plano para este produto, continuar com a criação
    const newPlan = await db.insert(inspectionPlans)
      .values({
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    const duration = Date.now() - startTime;
    
    logger.crud('INSPECTION_PLANS', {
      operation: 'CREATE',
      entity: 'inspection_plans',
      entityId: newPlan[0].id,
      changes: planData,
      result: { 
        id: newPlan[0].id,
        planName: newPlan[0].planName,
        productId: newPlan[0].productId
      },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'CREATE_PLAN', duration, { 
      id: newPlan[0].id,
      planName: newPlan[0].planName 
    });

    res.status(201).json(newPlan[0]);
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'CREATE_PLAN_ERROR', error, { 
      planName: req.body?.planName,
      productId: req.body?.productId,
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao criar plano de inspeção' });
  }
});

// POST /api/inspection-plans/:id/duplicate - Duplicar plano
router.post('/:id/duplicate', async (req: any, res) => {
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
      planId: req.params.id, 
      newPlanCode: req.body.newPlanCode, 
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao duplicar plano de inspeção' });
  }
});

// PATCH /api/inspection-plans/:id - Atualizar plano
router.patch('/:id', async (req: any, res) => {
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

    // Filtrar campos que não devem ser atualizados
    const { createdBy, id: _, ...safeUpdateData } = updateData;
    
    // Atualizar plano
    const result = await db.update(inspectionPlans)
      .set({
        ...safeUpdateData,
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
        changes: filterRelevantChanges(updateData)
      }
    });

    const duration = Date.now() - startTime;
    
    logger.crud('INSPECTION_PLANS', {
      operation: 'UPDATE',
      entity: 'inspection_plans',
      entityId: req.params.id,
      changes: updateData,
      result: { 
        id: req.params.id,
        version: newVersion,
        updatedFields: Object.keys(updateData)
      },
      success: true
    }, req);
    
    logger.performance('INSPECTION_PLANS', 'UPDATE_PLAN', duration, { id: req.params.id }, req);

    res.json(updatedPlan);
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'UPDATE_PLAN_ERROR', error, { 
      id: req.params.id, 
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
router.delete('/:id', async (req: any, res) => {
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
        id: id,
        status: 'inactive'
      },
      success: true
    });
    
    logger.performance('INSPECTION_PLANS', 'ARCHIVE_PLAN', duration, { id: id });

    res.json({ message: 'Plano de inspeção arquivado com sucesso' });
  } catch (error) {
    logger.error('INSPECTION_PLANS', 'ARCHIVE_PLAN_ERROR', error, { 
      id: id, 
      userId: req.user?.id 
    });
    res.status(500).json({ message: 'Erro ao arquivar plano de inspeção' });
  }
});

export default router;
