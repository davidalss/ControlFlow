import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'controlflow_db',
  user: process.env.DB_USER || 'controlflow_db',
  password: process.env.DB_PASSWORD || '123'
});

// Log helper
const logOperation = (operation: string, details: any, success: boolean, error?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    details,
    success,
    error: error?.message || null
  };
  
  console.log(`[PRODUCTS API] ${timestamp} - ${operation}:`, logEntry);
  
  // Em caso de erro, log mais detalhado
  if (!success && error) {
    console.error(`[PRODUCTS API ERROR] ${operation}:`, error);
  }
};

// GET /api/products - Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        code,
        description,
        ean,
        category,
        family,
        business_unit as "businessUnit",
        technical_parameters as "technicalParameters",
        created_at as "createdAt"
      FROM products 
      ORDER BY created_at DESC
    `);
    
    logOperation('GET_PRODUCTS', { count: result.rows.length }, true);
    res.json(result.rows);
  } catch (error: any) {
    logOperation('GET_PRODUCTS', {}, false, error);
    res.status(500).json({ 
      error: 'Erro ao buscar produtos',
      details: error.message 
    });
  }
});

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        code,
        description,
        ean,
        category,
        family,
        business_unit as "businessUnit",
        technical_parameters as "technicalParameters",
        created_at as "createdAt"
      FROM products 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      logOperation('GET_PRODUCT_BY_ID', { id }, false, new Error('Produto não encontrado'));
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    logOperation('GET_PRODUCT_BY_ID', { id }, true);
    res.json(result.rows[0]);
  } catch (error: any) {
    logOperation('GET_PRODUCT_BY_ID', { id: req.params.id }, false, error);
    res.status(500).json({ 
      error: 'Erro ao buscar produto',
      details: error.message 
    });
  }
});

// POST /api/products - Criar novo produto
router.post('/', async (req, res) => {
  try {
    const { 
      code, 
      description, 
      ean, 
      category, 
      family, 
      businessUnit, 
      technicalParameters 
    } = req.body;
    
    // Validações básicas
    if (!code || !description || !category) {
      logOperation('CREATE_PRODUCT', req.body, false, new Error('Campos obrigatórios não preenchidos'));
      return res.status(400).json({ 
        error: 'Campos obrigatórios: code, description, category' 
      });
    }
    
    // Verificar se o código já existe
    const existingProduct = await pool.query(
      'SELECT id FROM products WHERE code = $1',
      [code]
    );
    
    if (existingProduct.rows.length > 0) {
      logOperation('CREATE_PRODUCT', req.body, false, new Error('Código de produto já existe'));
      return res.status(409).json({ 
        error: 'Código de produto já existe' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO products (
        code, 
        description, 
        ean, 
        category, 
        family, 
        business_unit, 
        technical_parameters
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        code,
        description,
        ean,
        category,
        family,
        business_unit as "businessUnit",
        technical_parameters as "technicalParameters",
        created_at as "createdAt"
    `, [code, description, ean, category, family, businessUnit, technicalParameters]);
    
    const newProduct = result.rows[0];
    logOperation('CREATE_PRODUCT', { id: newProduct.id, code }, true);
    res.status(201).json(newProduct);
  } catch (error: any) {
    logOperation('CREATE_PRODUCT', req.body, false, error);
    res.status(500).json({ 
      error: 'Erro ao criar produto',
      details: error.message 
    });
  }
});

// PATCH /api/products/:id - Atualizar produto
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, 
      description, 
      ean, 
      category, 
      family, 
      businessUnit, 
      technicalParameters 
    } = req.body;
    
    // Verificar se o produto existe
    const existingProduct = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );
    
    if (existingProduct.rows.length === 0) {
      logOperation('UPDATE_PRODUCT', { id, ...req.body }, false, new Error('Produto não encontrado'));
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Se o código foi alterado, verificar se já existe
    if (code) {
      const duplicateCode = await pool.query(
        'SELECT id FROM products WHERE code = $1 AND id != $2',
        [code, id]
      );
      
      if (duplicateCode.rows.length > 0) {
        logOperation('UPDATE_PRODUCT', { id, ...req.body }, false, new Error('Código de produto já existe'));
        return res.status(409).json({ 
          error: 'Código de produto já existe' 
        });
      }
    }
    
    // Construir query dinâmica
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (code !== undefined) {
      updateFields.push(`code = $${paramCount++}`);
      values.push(code);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (ean !== undefined) {
      updateFields.push(`ean = $${paramCount++}`);
      values.push(ean);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (family !== undefined) {
      updateFields.push(`family = $${paramCount++}`);
      values.push(family);
    }
    if (businessUnit !== undefined) {
      updateFields.push(`business_unit = $${paramCount++}`);
      values.push(businessUnit);
    }
    if (technicalParameters !== undefined) {
      updateFields.push(`technical_parameters = $${paramCount++}`);
      values.push(technicalParameters);
    }
    
    if (updateFields.length === 0) {
      logOperation('UPDATE_PRODUCT', { id }, false, new Error('Nenhum campo para atualizar'));
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    values.push(id);
    const result = await pool.query(`
      UPDATE products 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING 
        id,
        code,
        description,
        ean,
        category,
        family,
        business_unit as "businessUnit",
        technical_parameters as "technicalParameters",
        created_at as "createdAt"
    `, values);
    
    const updatedProduct = result.rows[0];
    logOperation('UPDATE_PRODUCT', { id, updatedFields: updateFields }, true);
    res.json(updatedProduct);
  } catch (error: any) {
    logOperation('UPDATE_PRODUCT', { id: req.params.id, ...req.body }, false, error);
    res.status(500).json({ 
      error: 'Erro ao atualizar produto',
      details: error.message 
    });
  }
});

// DELETE /api/products/:id - Excluir produto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o produto existe
    const existingProduct = await pool.query(
      'SELECT id, code FROM products WHERE id = $1',
      [id]
    );
    
    if (existingProduct.rows.length === 0) {
      logOperation('DELETE_PRODUCT', { id }, false, new Error('Produto não encontrado'));
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const productToDelete = existingProduct.rows[0];
    
    // Excluir o produto
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    logOperation('DELETE_PRODUCT', { id, code: productToDelete.code }, true);
    res.status(200).json({ 
      message: 'Produto excluído com sucesso',
      deletedProduct: { id, code: productToDelete.code }
    });
  } catch (error: any) {
    logOperation('DELETE_PRODUCT', { id: req.params.id }, false, error);
    res.status(500).json({ 
      error: 'Erro ao excluir produto',
      details: error.message 
    });
  }
});

// GET /api/products/stats - Estatísticas dos produtos
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT business_unit) as total_business_units,
        COUNT(DISTINCT family) as total_families
      FROM products
    `);
    
    const businessUnitStats = await pool.query(`
      SELECT 
        business_unit,
        COUNT(*) as count
      FROM products 
      GROUP BY business_unit 
      ORDER BY count DESC
    `);
    
    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM products 
      GROUP BY category 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    logOperation('GET_PRODUCT_STATS', {}, true);
    res.json({
      overview: stats.rows[0],
      businessUnits: businessUnitStats.rows,
      topCategories: categoryStats.rows
    });
  } catch (error: any) {
    logOperation('GET_PRODUCT_STATS', {}, false, error);
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      details: error.message 
    });
  }
});

export default router;
