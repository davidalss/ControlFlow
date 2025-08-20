const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Configuração do banco
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';
const client = postgres(connectionString);
const db = drizzle(client);

async function checkAndFixDatabaseIssues() {
  console.log('🔍 Verificando problemas no banco de dados...');
  
  try {
    // 1. Verificar se as tabelas existem
    console.log('\n📋 Verificando existência das tabelas...');
    
    const tables = [
      'suppliers',
      'supplier_evaluations', 
      'supplier_audits',
      'supplier_products',
      'inspection_plans',
      'inspection_plan_revisions',
      'inspection_plan_products'
    ];
    
    for (const table of tables) {
      try {
        const result = await client`SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        )`;
        
        const exists = result[0].exists;
        console.log(`  ${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTE' : 'NÃO EXISTE'}`);
        
        if (!exists) {
          console.log(`    ⚠️  Tabela ${table} não existe!`);
        }
      } catch (error) {
        console.log(`  ❌ ${table}: ERRO - ${error.message}`);
      }
    }
    
    // 2. Verificar estrutura da tabela suppliers
    console.log('\n🔧 Verificando estrutura da tabela suppliers...');
    try {
      const columns = await client`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'suppliers' 
        ORDER BY ordinal_position
      `;
      
      console.log('  Colunas encontradas:');
      columns.forEach(col => {
        console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Verificar se a coluna rating existe
      const hasRating = columns.some(col => col.column_name === 'rating');
      if (!hasRating) {
        console.log('  ⚠️  Coluna rating não encontrada!');
      }
      
    } catch (error) {
      console.log(`  ❌ Erro ao verificar estrutura: ${error.message}`);
    }
    
    // 3. Verificar estrutura da tabela inspection_plans
    console.log('\n🔧 Verificando estrutura da tabela inspection_plans...');
    try {
      const columns = await client`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'inspection_plans' 
        ORDER BY ordinal_position
      `;
      
      console.log('  Colunas encontradas:');
      columns.forEach(col => {
        console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
    } catch (error) {
      console.log(`  ❌ Erro ao verificar estrutura: ${error.message}`);
    }
    
    // 4. Testar consultas que estão falhando
    console.log('\n🧪 Testando consultas que estão falhando...');
    
    // Testar consulta de estatísticas de fornecedores
    try {
      console.log('  Testando consulta de estatísticas de fornecedores...');
      const statsResult = await client`
        SELECT 
          COUNT(*) as total_suppliers,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_suppliers,
          COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_suppliers,
          AVG(rating) as avg_rating
        FROM suppliers
      `;
      
      console.log('  ✅ Consulta de estatísticas funcionou:', statsResult[0]);
    } catch (error) {
      console.log(`  ❌ Erro na consulta de estatísticas: ${error.message}`);
    }
    
    // Testar consulta de planos de inspeção
    try {
      console.log('  Testando consulta de planos de inspeção...');
      const plansResult = await client`
        SELECT id, plan_code, plan_name, status, created_at
        FROM inspection_plans
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      console.log(`  ✅ Consulta de planos funcionou: ${plansResult.length} planos encontrados`);
    } catch (error) {
      console.log(`  ❌ Erro na consulta de planos: ${error.message}`);
    }
    
    // 5. Verificar dados de exemplo
    console.log('\n📊 Verificando dados de exemplo...');
    
    try {
      const suppliersCount = await client`SELECT COUNT(*) as count FROM suppliers`;
      console.log(`  Fornecedores: ${suppliersCount[0].count}`);
      
      const plansCount = await client`SELECT COUNT(*) as count FROM inspection_plans`;
      console.log(`  Planos de inspeção: ${plansCount[0].count}`);
      
    } catch (error) {
      console.log(`  ❌ Erro ao contar dados: ${error.message}`);
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await client.end();
  }
}

// Executar a verificação
checkAndFixDatabaseIssues();
