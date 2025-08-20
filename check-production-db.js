const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: './env.production' });

async function checkProductionDatabase() {
  console.log('🔍 Verificando banco de dados de produção...');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('🔗 DATABASE_URL encontrada:', connectionString ? 'Sim' : 'Não');
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL não encontrada no env.production');
    return;
  }

  const sql = postgres(connectionString);

  try {
    // Verificar se a tabela inspection_plans existe
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
      console.log('💡 Execute as migrações para criar a tabela');
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
    
    // Verificar se há problemas de permissão
    console.log('🔐 Verificando permissões...');
    
    const permissions = await sql`
      SELECT grantee, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_name = 'inspection_plans';
    `;
    
    console.log('   - Permissões encontradas:');
    permissions.forEach(perm => {
      console.log(`     * ${perm.grantee}: ${perm.privilege_type}`);
    });
    
    console.log('✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
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
checkProductionDatabase().catch(console.error); 