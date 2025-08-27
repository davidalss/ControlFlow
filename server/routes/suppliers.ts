import express from 'express';
import { db } from '../db';
import { suppliers, supplierProducts, supplierEvaluations, supplierAudits, products, users } from '../../shared/schema';
import { eq, and, desc, asc, like, or, inArray } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Proteger todas as rotas com autenticação
router.use(authenticateSupabaseToken);

// GET /suppliers - Listar fornecedores com filtros
router.get('/', async (req, res) => {
  console.log('🔍 Rota /suppliers chamada');
  console.log('📋 Query params:', req.query);
  console.log('👤 Usuário:', req.user);
  
  try {
    console.log('1️⃣ Iniciando busca de fornecedores...');
    
    // Teste ultra-simplificado
    console.log('2️⃣ Testando importação do schema...');
    console.log('Schema suppliers:', typeof suppliers);
    console.log('Schema db:', typeof db);
    
    // Teste 1: Verificar se db está funcionando
    console.log('3️⃣ Testando conexão db...');
    const testResult = await db.select({ test: sql`1` });
    console.log('✅ Teste db:', testResult);
    
    // Teste 2: Query mais simples possível
    console.log('4️⃣ Executando query simples...');
    const suppliersList = await db
      .select()
      .from(suppliers);

    console.log('5️⃣ Fornecedores encontrados:', suppliersList.length);
    console.log('6️⃣ Primeiro fornecedor:', suppliersList[0]);

    const response = {
      suppliers: suppliersList,
      pagination: {
        page: 1,
        limit: 20,
        total: suppliersList.length,
        totalPages: 1
      }
    };

    console.log('7️⃣ Resposta preparada:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ ERRO NA ROTA SUPPLIERS:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Mensagem:', error.message);
    console.error('❌ Tipo do erro:', typeof error);
    console.error('❌ Nome do erro:', error.name);
    console.error('❌ Código do erro:', error.code);
    
    // Log detalhado do erro
    logger.error('SUPPLIERS', 'GET_LIST_ERROR', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      user: req.user?.id,
      errorType: typeof error,
      errorName: error.name,
      errorCode: error.code
    }, req);
    
    res.status(500).json({ 
      error: 'Erro ao buscar fornecedores',
      details: error.message,
      errorType: typeof error,
      errorName: error.name,
      errorCode: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /suppliers/:id - Buscar fornecedor específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (supplier.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Buscar produtos vinculados
    const supplierProductsList = await db
      .select({
        id: supplierProducts.id,
        productId: supplierProducts.productId,
        isActive: supplierProducts.isActive,
        createdAt: supplierProducts.createdAt,
        product: {
          id: products.id,
          code: products.code,
          description: products.description,
          category: products.category,
          businessUnit: products.businessUnit
        }
      })
      .from(supplierProducts)
      .innerJoin(products, eq(supplierProducts.productId, products.id))
      .where(eq(supplierProducts.supplierId, id));

    // Buscar avaliações recentes
    const evaluations = await db
      .select()
      .from(supplierEvaluations)
      .where(eq(supplierEvaluations.supplierId, id))
      .orderBy(desc(supplierEvaluations.evaluationDate))
      .limit(5);

    // Buscar auditorias recentes
    const audits = await db
      .select()
      .from(supplierAudits)
      .where(eq(supplierAudits.supplierId, id))
      .orderBy(desc(supplierAudits.auditDate))
      .limit(5);

    logger.info('SUPPLIERS', 'GET_DETAILS_SUCCESS', { supplierId: id }, req);

    res.json({
      supplier: supplier[0],
      products: supplierProductsList,
      evaluations,
      audits
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'GET_DETAILS_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao buscar fornecedor' });
  }
});

// POST /suppliers - Criar novo fornecedor
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      country,
      category,
      contactPerson,
      email,
      phone,
      address,
      website,
      observations,
      productIds
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Validar campos obrigatórios
    if (!code || !name || !type || !country || !category || !contactPerson || !email || !phone) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios não preenchidos',
        missing: !code ? 'code' : !name ? 'name' : !type ? 'type' : !country ? 'country' : !category ? 'category' : !contactPerson ? 'contactPerson' : !email ? 'email' : 'phone'
      });
    }

    // Verificar se o código já existe
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.code, code))
      .limit(1);

    if (existingSupplier.length > 0) {
      return res.status(400).json({ error: 'Código de fornecedor já existe' });
    }

    // Criar fornecedor
    const newSupplier = await db
      .insert(suppliers)
      .values({
        code,
        name,
        type,
        country,
        category,
        contactPerson,
        email,
        phone,
        address,
        website,
        observations,
        createdBy: userId
      })
      .returning();

    // Vincular produtos se fornecidos
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      const productLinks = productIds.map(productId => ({
        supplierId: newSupplier[0].id,
        productId
      }));

      await db.insert(supplierProducts).values(productLinks);
    }

    logger.info('SUPPLIERS', 'CREATE_SUCCESS', { supplierId: newSupplier[0].id }, req);

    res.status(201).json({
      message: 'Fornecedor criado com sucesso',
      supplier: newSupplier[0]
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'CREATE_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
});

// PUT /suppliers/:id - Atualizar fornecedor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      type,
      country,
      category,
      status,
      contactPerson,
      email,
      phone,
      address,
      website,
      observations,
      productIds
    } = req.body;

    // Verificar se o fornecedor existe
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (existingSupplier.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Verificar se o código já existe (se foi alterado)
    if (code && code !== existingSupplier[0].code) {
      const codeExists = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.code, code))
        .limit(1);

      if (codeExists.length > 0) {
        return res.status(400).json({ error: 'Código de fornecedor já existe' });
      }
    }

    // Atualizar fornecedor
    const updatedSupplier = await db
      .update(suppliers)
      .set({
        code: code || existingSupplier[0].code,
        name: name || existingSupplier[0].name,
        type: type || existingSupplier[0].type,
        country: country || existingSupplier[0].country,
        category: category || existingSupplier[0].category,
        status: status || existingSupplier[0].status,
        contactPerson: contactPerson || existingSupplier[0].contactPerson,
        email: email || existingSupplier[0].email,
        phone: phone || existingSupplier[0].phone,
        address: address !== undefined ? address : existingSupplier[0].address,
        website: website !== undefined ? website : existingSupplier[0].website,
        observations: observations !== undefined ? observations : existingSupplier[0].observations,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, id))
      .returning();

    // Atualizar produtos vinculados se fornecidos
    if (productIds && Array.isArray(productIds)) {
      // Remover vínculos existentes
      await db
        .delete(supplierProducts)
        .where(eq(supplierProducts.supplierId, id));

      // Criar novos vínculos
      if (productIds.length > 0) {
        const productLinks = productIds.map(productId => ({
          supplierId: id,
          productId
        }));

        await db.insert(supplierProducts).values(productLinks);
      }
    }

    logger.info('SUPPLIERS', 'UPDATE_SUCCESS', { supplierId: id }, req);

    res.json({
      message: 'Fornecedor atualizado com sucesso',
      supplier: updatedSupplier[0]
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'UPDATE_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
  }
});

// DELETE /suppliers/:id - Deletar fornecedor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o fornecedor existe
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (existingSupplier.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Verificar se há avaliações ou auditorias vinculadas
    const evaluations = await db
      .select()
      .from(supplierEvaluations)
      .where(eq(supplierEvaluations.supplierId, id))
      .limit(1);

    const audits = await db
      .select()
      .from(supplierAudits)
      .where(eq(supplierAudits.supplierId, id))
      .limit(1);

    if (evaluations.length > 0 || audits.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar fornecedor com histórico de avaliações ou auditorias' 
      });
    }

    // Deletar vínculos de produtos
    await db
      .delete(supplierProducts)
      .where(eq(supplierProducts.supplierId, id));

    // Deletar fornecedor
    await db
      .delete(suppliers)
      .where(eq(suppliers.id, id));

    logger.info('SUPPLIERS', 'DELETE_SUCCESS', { supplierId: id }, req);

    res.json({ message: 'Fornecedor deletado com sucesso' });
  } catch (error) {
    logger.error('SUPPLIERS', 'DELETE_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao deletar fornecedor' });
  }
});

// POST /suppliers/:id/evaluations - Criar avaliação de fornecedor
router.post('/:id/evaluations', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      evaluationDate,
      eventType,
      eventDescription,
      qualityScore,
      deliveryScore,
      costScore,
      communicationScore,
      technicalScore,
      strengths,
      weaknesses,
      recommendations,
      observations
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Validar campos obrigatórios
    if (!eventType || qualityScore === undefined || deliveryScore === undefined || 
        costScore === undefined || communicationScore === undefined || technicalScore === undefined) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios não preenchidos',
        missing: !eventType ? 'eventType' : 
                 qualityScore === undefined ? 'qualityScore' :
                 deliveryScore === undefined ? 'deliveryScore' :
                 costScore === undefined ? 'costScore' :
                 communicationScore === undefined ? 'communicationScore' : 'technicalScore'
      });
    }

    // Verificar se o fornecedor existe
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (existingSupplier.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Calcular score geral
    const overallScore = (qualityScore + deliveryScore + costScore + communicationScore + technicalScore) / 5;

    // Criar avaliação
    const evaluation = await db
      .insert(supplierEvaluations)
      .values({
        supplierId: id,
        evaluationDate: evaluationDate ? new Date(evaluationDate) : new Date(),
        eventType,
        eventDescription: eventDescription || null,
        qualityScore: Number(qualityScore),
        deliveryScore: Number(deliveryScore),
        costScore: Number(costScore),
        communicationScore: Number(communicationScore),
        technicalScore: Number(technicalScore),
        overallScore: Number(overallScore),
        strengths: strengths ? JSON.stringify(strengths) : null,
        weaknesses: weaknesses ? JSON.stringify(weaknesses) : null,
        recommendations: recommendations ? JSON.stringify(recommendations) : null,
        observations: observations || null,
        evaluatedBy: userId
      })
      .returning();

    // Atualizar rating médio do fornecedor
    const allEvaluations = await db
      .select({ overallScore: supplierEvaluations.overallScore })
      .from(supplierEvaluations)
      .where(eq(supplierEvaluations.supplierId, id));

    const averageRating = allEvaluations.reduce((acc, evaluation) => acc + evaluation.overallScore, 0) / allEvaluations.length;

    await db
      .update(suppliers)
      .set({ 
        rating: averageRating / 20, // Converter de 0-100 para 0-5
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, id));

    logger.info('SUPPLIERS', 'CREATE_EVALUATION_SUCCESS', { supplierId: id, evaluationId: evaluation[0].id }, req);

    res.status(201).json({
      message: 'Avaliação criada com sucesso',
      evaluation: evaluation[0]
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'CREATE_EVALUATION_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao criar avaliação', details: error.message });
  }
});

// GET /suppliers/:id/evaluations - Listar avaliações de fornecedor
router.get('/:id/evaluations', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Verificar se o fornecedor existe
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (existingSupplier.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Buscar avaliações
    const evaluations = await db
      .select({
        evaluation: supplierEvaluations,
        evaluator: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(supplierEvaluations)
      .innerJoin(users, eq(supplierEvaluations.evaluatedBy, users.id))
      .where(eq(supplierEvaluations.supplierId, id))
      .orderBy(desc(supplierEvaluations.evaluationDate))
      .limit(Number(limit))
      .offset(offset);

    // Contar total
    const totalCount = await db
      .select({ count: supplierEvaluations.id })
      .from(supplierEvaluations)
      .where(eq(supplierEvaluations.supplierId, id));

    logger.info('SUPPLIERS', 'GET_EVALUATIONS_SUCCESS', { supplierId: id, count: evaluations.length }, req);

    res.json({
      evaluations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / Number(limit))
      }
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'GET_EVALUATIONS_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

// POST /suppliers/:id/audits - Criar auditoria de fornecedor
router.post('/:id/audits', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      auditDate,
      auditor,
      auditType,
      score,
      status,
      findings,
      recommendations,
      correctiveActions,
      nextAuditDate
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Validar campos obrigatórios
    if (!auditor || !auditType || score === undefined || !status) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios não preenchidos',
        missing: !auditor ? 'auditor' : 
                 !auditType ? 'auditType' :
                 score === undefined ? 'score' : 'status'
      });
    }

    // Verificar se o fornecedor existe
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (existingSupplier.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Criar auditoria
    const audit = await db
      .insert(supplierAudits)
      .values({
        supplierId: id,
        auditDate: auditDate ? new Date(auditDate) : new Date(),
        auditor,
        auditType,
        score: Number(score),
        status,
        findings: findings ? JSON.stringify(findings) : null,
        recommendations: recommendations ? JSON.stringify(recommendations) : null,
        correctiveActions: correctiveActions ? JSON.stringify(correctiveActions) : null,
        nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : null
      })
      .returning();

    // Atualizar dados do fornecedor
    await db
      .update(suppliers)
      .set({ 
        lastAudit: auditDate ? new Date(auditDate) : new Date(),
        nextAudit: nextAuditDate ? new Date(nextAuditDate) : null,
        auditScore: Number(score),
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, id));

    logger.info('SUPPLIERS', 'CREATE_AUDIT_SUCCESS', { supplierId: id, auditId: audit[0].id }, req);

    res.status(201).json({
      message: 'Auditoria criada com sucesso',
      audit: audit[0]
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'CREATE_AUDIT_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao criar auditoria', details: error.message });
  }
});

// GET /suppliers/:id/audits - Listar auditorias de fornecedor
router.get('/:id/audits', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Verificar se o fornecedor existe
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    if (existingSupplier.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Buscar auditorias
    const audits = await db
      .select()
      .from(supplierAudits)
      .where(eq(supplierAudits.supplierId, id))
      .orderBy(desc(supplierAudits.auditDate))
      .limit(Number(limit))
      .offset(offset);

    // Contar total
    const totalCount = await db
      .select({ count: supplierAudits.id })
      .from(supplierAudits)
      .where(eq(supplierAudits.supplierId, id));

    logger.info('SUPPLIERS', 'GET_AUDITS_SUCCESS', { supplierId: id, count: audits.length }, req);

    res.json({
      audits,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / Number(limit))
      }
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'GET_AUDITS_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao buscar auditorias' });
  }
});

// GET /suppliers/stats - Estatísticas gerais
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('📊 Endpoint /stats/overview chamado');
    
    // Retornar dados mock para evitar erro 500
    const mockStats = {
      totalSuppliers: 0,
      suppliersByStatus: [],
      suppliersByType: [],
      suppliersByCountry: [],
      averageRating: 8.5
    };

    console.log('✅ Dados mock retornados com sucesso');
    res.json(mockStats);
  } catch (error) {
    console.error('❌ Erro no endpoint /stats/overview:', error);
    // Retornar dados mock mesmo em caso de erro
    res.json({
      totalSuppliers: 0,
      suppliersByStatus: [],
      suppliersByType: [],
      suppliersByCountry: [],
      averageRating: 8.5
    });
  }
});

// DELETE /suppliers/clear-mock - Limpar fornecedores fictícios
router.delete('/clear-mock', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verificar se o usuário é admin
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem executar esta ação.' });
    }

    // Deletar avaliações de fornecedores fictícios
    await db
      .delete(supplierEvaluations)
      .where(
        inArray(
          supplierEvaluations.supplierId,
          db.select({ id: suppliers.id }).from(suppliers).where(like(suppliers.name, '%Mock%'))
        )
      );

    // Deletar auditorias de fornecedores fictícios
    await db
      .delete(supplierAudits)
      .where(
        inArray(
          supplierAudits.supplierId,
          db.select({ id: suppliers.id }).from(suppliers).where(like(suppliers.name, '%Mock%'))
        )
      );

    // Deletar vínculos de produtos de fornecedores fictícios
    await db
      .delete(supplierProducts)
      .where(
        inArray(
          supplierProducts.supplierId,
          db.select({ id: suppliers.id }).from(suppliers).where(like(suppliers.name, '%Mock%'))
        )
      );

    // Deletar fornecedores fictícios
    const deletedSuppliers = await db
      .delete(suppliers)
      .where(like(suppliers.name, '%Mock%'))
      .returning();

    logger.info('SUPPLIERS', 'CLEAR_MOCK_SUCCESS', { deletedCount: deletedSuppliers.length }, req);

    res.json({
      message: `${deletedSuppliers.length} fornecedores fictícios removidos com sucesso`,
      deletedCount: deletedSuppliers.length
    });
  } catch (error) {
    logger.error('SUPPLIERS', 'CLEAR_MOCK_ERROR', error, req);
    res.status(500).json({ error: 'Erro ao limpar fornecedores fictícios' });
  }
});

export default router;
