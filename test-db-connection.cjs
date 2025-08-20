const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env.production') });

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  console.log('📁 Diretório atual:', __dirname);
  console.log('📄 Arquivo .env.production:', path.join(__dirname, 'env.production'));
  
  try {
    // Conectar ao banco
    const connectionString = process.env.DATABASE_URL;
    console.log('📡 String de conexão:', connectionString ? 'Configurada' : 'NÃO CONFIGURADA');
    
    if (!connectionString) {
      console.error('❌ DATABASE_URL não configurada no .env.production');
      console.log('🔍 Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
      return;
    }
    
    const sql = postgres(connectionString);
    const db = drizzle(sql);
    
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Verificar se a tabela existe
    console.log('\n🔍 Verificando se a tabela inspection_plans existe...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `;
    
    console.log('📋 Tabela inspection_plans existe:', tableCheck[0].exists);
    
    if (tableCheck[0].exists) {
      // Verificar estrutura da tabela
      console.log('\n🔍 Verificando estrutura da tabela inspection_plans...');
      const tableStructure = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Estrutura da tabela:');
      tableStructure.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Verificar se há dados
      console.log('\n🔍 Verificando dados na tabela...');
      const dataCount = await sql`
        SELECT COUNT(*) as count FROM inspection_plans;
      `;
      
      console.log('📊 Total de registros:', dataCount[0].count);
      
      if (dataCount[0].count > 0) {
        // Verificar um registro de exemplo
        console.log('\n🔍 Exemplo de registro:');
        const sampleRecord = await sql`
          SELECT * FROM inspection_plans LIMIT 1;
        `;
        
        console.log('📋 Registro de exemplo:', JSON.stringify(sampleRecord[0], null, 2));
      }
    }
    
    // Testar operação DELETE
    console.log('\n🔍 Testando operação DELETE...');
    try {
      const testId = '84f3fe8e-1721-4ac7-9e14-4fcb0acc0c67';
      
      // Verificar se o registro existe
      const recordExists = await sql`
        SELECT id FROM inspection_plans WHERE id = ${testId};
      `;
      
      console.log('📋 Registro existe:', recordExists.length > 0);
      
      if (recordExists.length > 0) {
        // Tentar fazer o DELETE
        const deleteResult = await sql`
          UPDATE inspection_plans 
          SET status = 'inactive', updated_at = NOW()
          WHERE id = ${testId}
          RETURNING id, status;
        `;
        
        console.log('✅ Operação UPDATE realizada com sucesso:', deleteResult[0]);
      } else {
        console.log('⚠️ Registro não encontrado para teste');
      }
    } catch (deleteError) {
      console.error('❌ Erro na operação DELETE:', deleteError.message);
    }
    
    await sql.end();
    console.log('\n✅ Teste concluído');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDatabaseConnection();
