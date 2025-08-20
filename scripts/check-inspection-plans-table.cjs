const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.production') });

async function checkInspectionPlansTable() {
  console.log('🔍 Verificando tabela de planos de inspeção...');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('🔗 DATABASE_URL encontrada:', connectionString ? 'Sim' : 'Não');
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL não encontrada no env.production');
    console.log('📁 Arquivo procurado:', path.join(__dirname, '..', 'env.production'));
    return;
  }

  const sql = postgres(connectionString);
  const db = drizzle(sql);

  try {
    // Verificar se a tabela existe
    console.log('📋 Verificando se a tabela inspection_plans existe...');
    
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.error('❌ Tabela inspection_plans não existe!');
      console.log('💡 Execute as migrações para criar a tabela:');
      console.log('   npm run db:migrate');
      return;
    }
    
    console.log('✅ Tabela inspection_plans existe');
    
    // Verificar estrutura da tabela
    console.log('📊 Verificando estrutura da tabela...');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'inspection_plans'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Colunas encontradas:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // Verificar se há dados na tabela
    console.log('📈 Verificando dados na tabela...');
    
    const count = await sql`SELECT COUNT(*) as count FROM inspection_plans;`;
    console.log(`   - Total de registros: ${count[0].count}`);
    
    if (count[0].count > 0) {
      const sample = await sql`SELECT id, plan_code, plan_name, created_at FROM inspection_plans LIMIT 3;`;
      console.log('   - Amostra de registros:');
      sample.forEach(record => {
        console.log(`     * ${record.plan_code}: ${record.plan_name} (${record.created_at})`);
      });
    }
    
    // Verificar se há índices
    console.log('🔍 Verificando índices...');
    
    const indexes = await sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'inspection_plans';
    `;
    
    if (indexes.length > 0) {
      console.log('   - Índices encontrados:');
      indexes.forEach(idx => {
        console.log(`     * ${idx.indexname}`);
      });
    } else {
      console.log('   - Nenhum índice encontrado');
    }
    
    console.log('✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await sql.end();
  }
}

// Executar verificação
checkInspectionPlansTable().catch(console.error);
