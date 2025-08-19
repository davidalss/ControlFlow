#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔍 Verificando usuário no Supabase...\n');

// Configurações do Supabase (hardcoded para teste)
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

console.log('📋 Configurações:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', `${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Testar login
async function testLogin() {
  const email = 'david.pedro@wap.ind.br';
  const password = 'david.pedro@wap.ind.br';
  
  console.log(`🧪 Testando login com: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('📥 Resposta do Supabase:');
    console.log('- Data:', data ? 'Sucesso' : 'Nenhum dado');
    console.log('- Error:', error ? error.message : 'Nenhum erro');
    
    if (error) {
      console.log('❌ Erro detalhado:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 SUGESTÕES:');
        console.log('1. Verificar se o usuário existe no Supabase Auth');
        console.log('2. Verificar se a senha está correta');
        console.log('3. Verificar se o email está correto');
        console.log('4. Tentar resetar a senha do usuário');
      }
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', data.user?.email);
      console.log('🆔 ID:', data.user?.id);
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

testLogin().catch(console.error);
