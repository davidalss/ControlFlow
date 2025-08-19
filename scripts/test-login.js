#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
const envPath = path.join(process.cwd(), 'client', 'env.local');
dotenv.config({ path: envPath });

console.log('🔍 Testando login no Supabase...\n');

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('📋 Configurações:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NÃO ENCONTRADA');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Verifique se o arquivo client/env.local existe e contém:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Credenciais de teste
const testCredentials = [
  {
    email: 'david.pedro@wap.ind.br',
    password: 'david.pedro@wap.ind.br',
    description: 'Usuário admin'
  },
  {
    email: 'admin@enso.com',
    password: 'admin123',
    description: 'Usuário admin alternativo'
  }
];

async function testLogin() {
  for (const cred of testCredentials) {
    console.log(`🧪 Testando login: ${cred.description}`);
    console.log(`📧 Email: ${cred.email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      console.log('📤 Dados enviados:', { email: cred.email, password: '***' });
      console.log('📥 Resposta do Supabase:');
      console.log('- Data:', data ? 'Sucesso' : 'Nenhum dado');
      console.log('- Error:', error ? error.message : 'Nenhum erro');
      
      if (error) {
        console.log('❌ Erro detalhado:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log('👤 Usuário:', data.user?.email);
        console.log('🆔 ID:', data.user?.id);
      }
      
      // Fazer logout para testar próximo usuário
      await supabase.auth.signOut();
      
    } catch (err) {
      console.error('❌ Erro inesperado:', err.message);
    }
    
    console.log('─'.repeat(50));
  }
}

// Testar também a conexão básica
async function testConnection() {
  console.log('🔌 Testando conexão básica com Supabase...');
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
    } else {
      console.log('✅ Conexão bem-sucedida!');
    }
  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
  }
  
  console.log('');
}

// Executar testes
async function runTests() {
  await testConnection();
  await testLogin();
  
  console.log('🎯 Testes concluídos!');
}

runTests().catch(console.error);
