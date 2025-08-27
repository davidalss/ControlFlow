// Script para testar a conexão com o banco de dados
// Execute este script no terminal: node test-db-connection.js

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  try {
    // 1. Verificar variável de ambiente
    const connectionString = process.env.DATABASE_URL;
    console.log('1️⃣ DATABASE_URL:', connectionString ? 'Definida' : 'Não definida');
    
    if (!connectionString) {
      console.error('❌ DATABASE_URL não está definida');
      return;
    }
    
    // 2. Testar conexão com postgres
    console.log('2️⃣ Testando conexão postgres...');
    const client = postgres(connectionString);
    
    // Teste simples
    const result = await client`SELECT 1 as test`;
    console.log('✅ Conexão postgres funcionando:', result);
    
    // 3. Testar Drizzle
    console.log('3️⃣ Testando Drizzle...');
    const db = drizzle(client, { schema });
    
    // 4. Testar query simples
    console.log('4️⃣ Testando query simples...');
    const testQuery = await db.select().from(schema.suppliers).limit(1);
    console.log('✅ Query Drizzle funcionando:', testQuery);
    
    // 5. Testar contagem
    console.log('5️⃣ Testando contagem...');
    const countQuery = await db.select({ count: schema.suppliers.id }).from(schema.suppliers);
    console.log('✅ Contagem funcionando:', countQuery);
    
    // 6. Verificar estrutura da tabela
    console.log('6️⃣ Verificando estrutura da tabela...');
    const structureQuery = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'suppliers' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.log('✅ Estrutura da tabela:', structureQuery);
    
    await client.end();
    console.log('✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Mensagem:', error.message);
  }
}

testDatabaseConnection();
