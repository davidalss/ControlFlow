import postgres from 'postgres';

// Configuração do banco
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  console.log('📋 Connection string:', connectionString.replace(/:[^:@]*@/, ':****@'));
  
  let client;
  
  try {
    client = postgres(connectionString);
    
    console.log('✅ Conexão com banco estabelecida');
    
    // Testar se a tabela products existe
    console.log('🔍 Verificando se a tabela products existe...');
    const tableCheck = await client`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
    )`;
    
    if (tableCheck[0].exists) {
      console.log('✅ Tabela products encontrada');
      
      // Contar produtos
      const countResult = await client`SELECT COUNT(*) as total FROM products`;
      const total = countResult[0].total;
      console.log(`📊 Total de produtos: ${total}`);
      
      if (total > 0) {
        // Pegar primeiro produto
        const firstProduct = await client`SELECT id, code, description FROM products LIMIT 1`;
        console.log('📋 Primeiro produto:', firstProduct[0]);
      }
      
    } else {
      console.log('❌ Tabela products não encontrada');
    }
    
    // Testar query completa
    console.log('🔍 Testando query completa...');
    const allProducts = await client`SELECT * FROM products ORDER BY created_at DESC LIMIT 5`;
    console.log(`✅ Query executada com sucesso. Primeiros 5 produtos: ${allProducts.length}`);
    
    console.log('✅ Teste concluído com sucesso');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.message.includes('relation "products" does not exist')) {
      console.log('💡 Problema: Tabela products não existe no banco');
    } else if (error.message.includes('invalid password')) {
      console.log('💡 Problema: Senha do banco incorreta');
    } else if (error.message.includes('connection')) {
      console.log('💡 Problema: Erro de conexão com o banco');
    } else if (error.message.includes('permission denied')) {
      console.log('💡 Problema: Sem permissão para acessar a tabela');
    }
  } finally {
    if (client) {
      await client.end();
    }
  }
}

async function testAPIEndpoint() {
  console.log('\n🌐 Testando endpoint da API...');
  
  try {
    const response = await fetch('https://enso-backend-0aa1.onrender.com/api/products');
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API funcionando. Total de produtos: ${data.length}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Erro na API: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando testes de diagnóstico...\n');
  
  await testDatabaseConnection();
  await testAPIEndpoint();
  
  console.log('\n🏁 Testes concluídos');
}

main().catch(console.error);
