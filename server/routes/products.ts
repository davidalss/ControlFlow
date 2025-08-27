import express from 'express';
import { db } from '../db';
import { products } from '../../shared/schema';
import { eq, sql, count, desc } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateSupabaseToken);

// Middleware para capturar informações do usuário
const getUserInfo = (req: any) => {
  try {
    // Tentar extrair informações do usuário do token JWT
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Aqui você pode decodificar o token JWT para obter o userId
      // Por enquanto, vamos usar um identificador genérico
      return 'authenticated_user';
    }
    return 'anonymous';
  } catch (error) {
    return 'unknown';
  }
};

// GET /api/products/search - Buscar produtos por termo
router.get('/search', async (req, res) => {
  const startTime = Date.now();
  const { q: searchTerm } = req.query;
  
  try {
    logger.info('PRODUCTS', 'SEARCH_PRODUCTS_START', { 
      searchTerm, 
      userId: getUserInfo(req) 
    }, req);
    
    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({ error: 'Termo de busca é obrigatório' });
    }
    
    // Primeiro tentar busca exata por EAN ou código
    let result = await db.select()
      .from(products)
      .where(
        sql`LOWER(${products.code}) = LOWER(${searchTerm}) OR 
            LOWER(${products.ean}) = LOWER(${searchTerm})`
      )
      .orderBy(desc(products.createdAt))
      .limit(1);
    
    // Se não encontrar busca exata, fazer busca parcial
    if (result.length === 0) {
      result = await db.select()
        .from(products)
        .where(
          sql`LOWER(${products.code}) LIKE LOWER(${`%${searchTerm}%`}) OR 
              LOWER(${products.description}) LIKE LOWER(${`%${searchTerm}%`}) OR
              LOWER(${products.ean}) LIKE LOWER(${`%${searchTerm}%`})`
        )
        .orderBy(desc(products.createdAt))
        .limit(20);
    }
    
    const duration = Date.now() - startTime;
    logger.crud('PRODUCTS', {
      operation: 'SEARCH',
      entity: 'products',
      result: { count: result.length, searchTerm },
      success: true
    }, req);
    
    logger.performance('PRODUCTS', 'SEARCH_PRODUCTS', duration, { 
      count: result.length, 
      searchTerm 
    }, req);
    
    res.json(result);
  } catch (error: any) {
    logger.error('PRODUCTS', 'SEARCH_PRODUCTS_ERROR', error, { 
      searchTerm, 
      userId: getUserInfo(req) 
    }, req);
    
    res.status(500).json({ 
      error: 'Erro ao buscar produtos',
      details: error.message 
    });
  }
});

// GET /api/products - Listar todos os produtos
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('PRODUCTS', 'GET_PRODUCTS_START', { userId: getUserInfo(req) }, req);
    
    const result = await db.select().from(products).orderBy(desc(products.createdAt));
    
    const duration = Date.now() - startTime;
    logger.crud('PRODUCTS', {
      operation: 'LIST',
      entity: 'products',
      result: { count: result.length },
      success: true
    }, req);
    
    logger.performance('PRODUCTS', 'GET_PRODUCTS', duration, { count: result.length }, req);
    
    res.json(result);
  } catch (error: any) {
    logger.error('PRODUCTS', 'GET_PRODUCTS_ERROR', error, { userId: getUserInfo(req) }, req);
    
    res.status(500).json({ 
      error: 'Erro ao buscar produtos',
      details: error.message 
    });
  }
});

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('PRODUCTS', 'GET_PRODUCT_BY_ID_START', { id, userId: getUserInfo(req) }, req);
    
    const result = await db.select().from(products).where(eq(products.id, id));
    
    if (result.length === 0) {
      logger.warn('PRODUCTS', 'GET_PRODUCT_BY_ID_NOT_FOUND', { id, userId: getUserInfo(req) }, req);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const duration = Date.now() - startTime;
    logger.crud('PRODUCTS', {
      operation: 'READ',
      entity: 'products',
      entityId: id,
      result: { code: result[0].code },
      success: true
    }, req);
    
    logger.performance('PRODUCTS', 'GET_PRODUCT_BY_ID', duration, { id }, req);
    
    res.json(result[0]);
  } catch (error: any) {
    logger.error('PRODUCTS', 'GET_PRODUCT_BY_ID_ERROR', error, { id, userId: getUserInfo(req) }, req);
    
    res.status(500).json({ 
      error: 'Erro ao buscar produto',
      details: error.message 
    });
  }
});

// POST /api/products - Criar novo produto
router.post('/', async (req, res) => {
  const startTime = Date.now();
  const { 
    code, 
    description, 
    ean, 
    category, 
    businessUnit
  } = req.body;
  const normalizedBusinessUnit = (businessUnit === undefined || businessUnit === null || String(businessUnit).trim() === '') 
    ? 'N/A' 
    : String(businessUnit).trim();
  
  try {
    logger.info('PRODUCTS', 'CREATE_PRODUCT_START', { 
      code, 
      description, 
      category,
      userId: getUserInfo(req) 
    }, req);
    
    // Validações básicas
    if (!code || !description || !category) {
      const error = new Error('Campos obrigatórios não preenchidos');
      logger.warn('PRODUCTS', 'CREATE_PRODUCT_VALIDATION_ERROR', { 
        receivedData: req.body,
        userId: getUserInfo(req) 
      }, req);
      
      return res.status(400).json({ 
        error: 'Campos obrigatórios: code, description, category' 
      });
    }
    
    // Verificar se o código já existe
    const existingProduct = await db.select().from(products).where(eq(products.code, code));
    
    if (existingProduct.length > 0) {
      const error = new Error('Código de produto já existe');
      logger.warn('PRODUCTS', 'CREATE_PRODUCT_DUPLICATE_ERROR', { 
        code,
        userId: getUserInfo(req) 
      }, req);
      
      return res.status(409).json({ 
        error: 'Código de produto já existe' 
      });
    }
    
    const result = await db.insert(products).values({
      code,
      description,
      ean,
      category,
      businessUnit: normalizedBusinessUnit,
      technicalParameters: null
    }).returning();
    
    const newProduct = result[0];
    const duration = Date.now() - startTime;
    
    logger.crud('PRODUCTS', {
      operation: 'CREATE',
      entity: 'products',
      entityId: newProduct.id,
      changes: { code, description, category, businessUnit },
      result: { id: newProduct.id, code: newProduct.code },
      success: true
    }, req);
    
    logger.performance('PRODUCTS', 'CREATE_PRODUCT', duration, { id: newProduct.id }, req);
    
    res.status(201).json(newProduct);
  } catch (error: any) {
    logger.error('PRODUCTS', 'CREATE_PRODUCT_ERROR', error, { 
      receivedData: req.body,
      userId: getUserInfo(req) 
    }, req);
    
    res.status(500).json({ 
      error: 'Erro ao criar produto',
      details: error.message 
    });
  }
});

// PATCH /api/products/:id - Atualizar produto
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  const { 
    code, 
    description, 
    ean, 
    category, 
    businessUnit
  } = req.body;
  const normalizedBusinessUnit = (businessUnit === undefined || businessUnit === null || String(businessUnit).trim() === '') 
    ? undefined 
    : String(businessUnit).trim();
  
  try {
    logger.info('PRODUCTS', 'UPDATE_PRODUCT_START', { 
      id, 
      updateData: req.body,
      userId: getUserInfo(req) 
    }, req);
    
    // Verificar se o produto existe
    const existingProduct = await db.select().from(products).where(eq(products.id, id));
    
    if (existingProduct.length === 0) {
      const error = new Error('Produto não encontrado');
      logger.warn('PRODUCTS', 'UPDATE_PRODUCT_NOT_FOUND', { 
        id, 
        userId: getUserInfo(req) 
      }, req);
      
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const originalProduct = existingProduct[0];
    
    // Se o código foi alterado, verificar se já existe
    if (code && code !== originalProduct.code) {
      const duplicateCode = await db.select().from(products).where(eq(products.code, code));
      
      if (duplicateCode.length > 0) {
        const error = new Error('Código de produto já existe');
        logger.warn('PRODUCTS', 'UPDATE_PRODUCT_DUPLICATE_ERROR', { 
          id, 
          newCode: code,
          userId: getUserInfo(req) 
        }, req);
        
        return res.status(409).json({ 
          error: 'Código de produto já existe' 
        });
      }
    }
    
    // Construir objeto de atualização
    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (ean !== undefined) updateData.ean = ean;
    if (category !== undefined) updateData.category = category;
    if (normalizedBusinessUnit !== undefined) updateData.businessUnit = normalizedBusinessUnit;
    
    if (Object.keys(updateData).length === 0) {
      const error = new Error('Nenhum campo para atualizar');
      logger.warn('PRODUCTS', 'UPDATE_PRODUCT_NO_FIELDS', { 
        id, 
        userId: getUserInfo(req) 
      }, req);
      
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    const result = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    
    const updatedProduct = result[0];
    const duration = Date.now() - startTime;
    
    logger.crud('PRODUCTS', {
      operation: 'UPDATE',
      entity: 'products',
      entityId: id,
      changes: updateData,
      result: { 
        id, 
        originalCode: originalProduct.code,
        newCode: updatedProduct.code,
        updatedFields: Object.keys(updateData)
      },
      success: true
    }, req);
    
    logger.performance('PRODUCTS', 'UPDATE_PRODUCT', duration, { id }, req);
    
    res.json(updatedProduct);
  } catch (error: any) {
    logger.error('PRODUCTS', 'UPDATE_PRODUCT_ERROR', error, { 
      id, 
      updateData: req.body,
      userId: getUserInfo(req) 
    }, req);
    
    res.status(500).json({ 
      error: 'Erro ao atualizar produto',
      details: error.message 
    });
  }
});

// DELETE /api/products/:id - Excluir produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const startTime = Date.now();
  
  try {
    logger.info('PRODUCTS', 'DELETE_PRODUCT_START', { 
      id, 
      userId: getUserInfo(req) 
    }, req);
    
    // Verificar se o produto existe
    const existingProduct = await db.select().from(products).where(eq(products.id, id));
    
    if (existingProduct.length === 0) {
      const error = new Error('Produto não encontrado');
      logger.warn('PRODUCTS', 'DELETE_PRODUCT_NOT_FOUND', { 
        id, 
        userId: getUserInfo(req) 
      }, req);
      
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const productToDelete = existingProduct[0];
    
    // Excluir o produto
    await db.delete(products).where(eq(products.id, id));
    
    const duration = Date.now() - startTime;
    
    logger.crud('PRODUCTS', {
      operation: 'DELETE',
      entity: 'products',
      entityId: id,
      result: { 
        id, 
        code: productToDelete.code
      },
      success: true
    }, req);
    
    logger.performance('PRODUCTS', 'DELETE_PRODUCT', duration, { id }, req);
    
    res.status(200).json({ 
      message: 'Produto excluído com sucesso',
      deletedProduct: { id, code: productToDelete.code }
    });
  } catch (error: any) {
    logger.error('PRODUCTS', 'DELETE_PRODUCT_ERROR', error, { 
      id, 
      userId: getUserInfo(req) 
    }, req);
    
    res.status(500).json({ 
      error: 'Erro ao excluir produto',
      details: error.message 
    });
  }
});

// GET /api/products/stats - Estatísticas dos produtos
router.get('/stats/overview', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('PRODUCTS', 'GET_PRODUCT_STATS_START', { userId: getUserInfo(req) }, req);
    
    const stats = await db.select({
      totalProducts: count(),
      totalCategories: sql`COUNT(DISTINCT ${products.category})`,
      totalBusinessUnits: sql`COUNT(DISTINCT ${products.businessUnit})`,
      totalFamilies: sql`COUNT(DISTINCT ${products.category})`
    }).from(products);
    
    const businessUnitStats = await db.select({
      businessUnit: products.businessUnit,
      count: count()
    }).from(products)
    .groupBy(products.businessUnit)
    .orderBy(desc(count()));
    
    const categoryStats = await db.select({
      category: products.category,
      count: count()
    }).from(products)
    .groupBy(products.category)
    .orderBy(desc(count()))
    .limit(10);
    
    const duration = Date.now() - startTime;
    
    logger.crud('PRODUCTS', {
      operation: 'READ',
      entity: 'products_stats',
      result: { 
        totalProducts: stats[0].totalProducts,
        totalCategories: stats[0].totalCategories,
        totalBusinessUnits: stats[0].totalBusinessUnits
      },
      success: true
    }, req);
    
    logger.performance('PRODUCTS', 'GET_PRODUCT_STATS', duration, { 
      totalProducts: stats[0].totalProducts 
    }, req);
    
    res.json({
      overview: stats[0],
      businessUnits: businessUnitStats,
      topCategories: categoryStats
    });
  } catch (error: any) {
    logger.error('PRODUCTS', 'GET_PRODUCT_STATS_ERROR', error, { 
      userId: getUserInfo(req) 
    }, req);
    
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      details: error.message 
    });
  }
});

export default router;
