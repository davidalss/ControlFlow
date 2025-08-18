#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testando conexão com o Supabase...');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente');
    process.exit(1);
  }
  
  console.log('📡 String de conexão:', connectionString.replace(/:[^:@]*@/, ':****@'));
  
  try {
    const client = postgres(connectionString);
    const db = drizzle(client);
    
    console.log('🔄 Conectando ao banco de dados...');
    
    // Teste simples de conexão
    const result = await client`SELECT version()`;
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Versão do PostgreSQL:', result[0].version);
    
    // Teste de listagem de tabelas
    console.log('📋 Listando tabelas existentes...');
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('📊 Tabelas encontradas:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('📝 Nenhuma tabela encontrada. Execute as migrações primeiro.');
    }
    
    await client.end();
    console.log('🎉 Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o Supabase:', error.message);
    console.error('💡 Verifique:');
    console.error('  1. Se as credenciais estão corretas');
    console.error('  2. Se o projeto Supabase está ativo');
    console.error('  3. Se a string de conexão está correta');
    process.exit(1);
  }
}

testConnection();
