const express = require('express');
const cors = require('cors');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: './env.production' });

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar banco de dados
let db;
try {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL não encontrada');
    process.exit(1);
  }
  
  const sql = postgres(connectionString);
  db = drizzle(sql);
  console.log('✅ Banco de dados conectado');
} catch (error) {
  console.error('❌ Erro ao conectar com o banco:', error);
  process.exit(1);
}

// Endpoint de teste
app.get('/api/inspection-plans/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Endpoint de debug para listar planos
app.get('/api/inspection-plans/debug', async (req, res) => {
  try {
    console.log('🔍 Endpoint debug chamado');
    
    // Verificar se a tabela existe
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `);
    
    console.log('📋 Tabela existe:', tableCheck[0]?.exists);
    
    if (!tableCheck[0]?.exists) {
      return res.status(404).json({
        error: 'Tabela inspection_plans não encontrada',
        tableExists: false
      });
    }
    
    // Buscar alguns registros
    const records = await db.execute(`
      SELECT id, plan_name, status, created_at
      FROM inspection_plans
      LIMIT 5
    `);
    
    console.log('📊 Registros encontrados:', records.length);
    
    res.json({
      message: 'Debug endpoint funcionando',
      timestamp: new Date().toISOString(),
      tableExists: tableCheck[0]?.exists,
      recordCount: records.length,
      records: records
    });
  } catch (error) {
    console.error('❌ Erro no debug endpoint:', error);
    res.status(500).json({
      error: 'Erro no debug endpoint',
      message: error.message,
      stack: error.stack
    });
  }
});

// Endpoint DELETE de teste
app.delete('/api/inspection-plans/debug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 DELETE debug chamado para ID:', id);
    
    // Verificar se o registro existe
    const recordExists = await db.execute(`
      SELECT id, plan_name, status FROM inspection_plans WHERE id = $1
    `, [id]);
    
    console.log('📋 Registro existe:', recordExists.length > 0);
    
    if (recordExists.length === 0) {
      return res.status(404).json({ 
        message: 'Registro não encontrado',
        id: id
      });
    }
    
    // Fazer o UPDATE (não DELETE)
    const result = await db.execute(`
      UPDATE inspection_plans 
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1
      RETURNING id, plan_name, status
    `, [id]);
    
    console.log('✅ UPDATE realizado:', result[0]);
    
    res.json({ 
      message: 'Operação realizada com sucesso',
      before: recordExists[0],
      after: result[0]
    });
  } catch (error) {
    console.error('❌ Erro no DELETE debug:', error);
    res.status(500).json({
      error: 'Erro no DELETE debug',
      message: error.message,
      stack: error.stack
    });
  }
});

// Endpoint GET de teste para listar planos
app.get('/api/inspection-plans/debug/list', async (req, res) => {
  try {
    console.log('🔍 List debug chamado');
    
    const plans = await db.execute(`
      SELECT 
        id,
        plan_code,
        plan_name,
        plan_type,
        version,
        status,
        product_name,
        business_unit,
        created_at,
        updated_at
      FROM inspection_plans
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log('📊 Planos encontrados:', plans.length);
    
    res.json({
      message: 'Lista de planos',
      count: plans.length,
      plans: plans
    });
  } catch (error) {
    console.error('❌ Erro no list debug:', error);
    res.status(500).json({
      error: 'Erro no list debug',
      message: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor teste rodando em http://localhost:${PORT}`);
  console.log('📋 Endpoints disponíveis:');
  console.log('  - GET  /api/inspection-plans/test');
  console.log('  - GET  /api/inspection-plans/debug');
  console.log('  - GET  /api/inspection-plans/debug/list');
  console.log('  - DELETE /api/inspection-plans/debug/:id');
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});
