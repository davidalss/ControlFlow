import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products } from '../shared/schema.ts';

// Configuração do banco
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  try {
    const client = postgres(connectionString);
    const db = drizzle(client, { schema: { products } });
    
    console.log('✅ Conexão com banco estabelecida');
    
    // Testar se a tabela products existe
    console.log('🔍 Verificando se a tabela products existe...');
    const result = await db.select().from(products).limit(1);
    console.log('✅ Tabela products encontrada');
    console.log(`📊 Total de produtos: ${result.length}`);
    
    // Testar query completa
    console.log('🔍 Testando query completa...');
    const allProducts = await db.select().from(products).orderBy(products.createdAt);
    console.log(`✅ Query executada com sucesso. Total: ${allProducts.length} produtos`);
    
    if (allProducts.length > 0) {
      console.log('📋 Primeiro produto:', {
        id: allProducts[0].id,
        code: allProducts[0].code,
        description: allProducts[0].description
      });
    }
    
    await client.end();
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
