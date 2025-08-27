// Script para verificar dados no banco
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'controlflow',
  user: 'postgres',
  password: 'postgres'
});

async function checkDatabase() {
  try {
    console.log('🔍 Verificando dados no banco de dados...');
    
    const client = await pool.connect();
    
    // Verificar estrutura da tabela
    console.log('\n📋 Estrutura da tabela inspection_plans:');
    const structureResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inspection_plans' 
      ORDER BY ordinal_position;
    `);
    
    structureResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Verificar dados
    console.log('\n📊 Dados na tabela inspection_plans:');
    const dataResult = await client.query(`
      SELECT 
        id,
        plan_code,
        plan_name,
        product_name,
        product_code,
        inspection_steps,
        checklists,
        created_at
      FROM inspection_plans 
      ORDER BY created_at DESC 
      LIMIT 3;
    `);
    
    dataResult.rows.forEach((row, index) => {
      console.log(`\n📋 Plano ${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  plan_code: ${row.plan_code}`);
      console.log(`  plan_name: ${row.plan_name}`);
      console.log(`  product_name: ${row.product_name}`);
      console.log(`  product_code: ${row.product_code}`);
      console.log(`  inspection_steps: ${row.inspection_steps ? row.inspection_steps.substring(0, 100) + '...' : 'null'}`);
      console.log(`  checklists: ${row.checklists ? row.checklists.substring(0, 100) + '...' : 'null'}`);
      console.log(`  created_at: ${row.created_at}`);
    });
    
    client.release();
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
