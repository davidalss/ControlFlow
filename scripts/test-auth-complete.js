#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔍 Testando autenticação completa do sistema...\n');

// Configurações do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

console.log('📋 Configurações:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', `${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteAuth() {
  const email = 'david.pedro@wap.ind.br';
  const password = 'david.pedro@wap.ind.br';
  
  console.log(`🧪 Testando autenticação completa com: ${email}`);
  
  try {
    // 1. Testar login
    console.log('\n1️⃣ Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.log('❌ Erro no login:', {
        message: loginError.message,
        status: loginError.status,
        name: loginError.name
      });
      return;
    }

    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', loginData.user?.email);
    console.log('🆔 ID:', loginData.user?.id);
    console.log('🎫 Access Token:', loginData.session?.access_token ? 'Presente' : 'Ausente');

    // 2. Testar sessão
    console.log('\n2️⃣ Testando sessão...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Erro ao obter sessão:', sessionError);
      return;
    }

    if (!session) {
      console.log('❌ Nenhuma sessão encontrada');
      return;
    }

    console.log('✅ Sessão válida!');
    console.log('🎫 Token de acesso:', session.access_token ? 'Presente' : 'Ausente');

    // 3. Testar API do backend
    console.log('\n3️⃣ Testando API do backend...');
    const backendUrl = 'https://enso-backend-0aa1.onrender.com';
    
    // Testar health check primeiro
    try {
      const healthResponse = await fetch(`${backendUrl}/api/health`);
      console.log('🏥 Health check:', healthResponse.status, healthResponse.statusText);
    } catch (error) {
      console.log('❌ Erro no health check:', error.message);
    }

    // Testar rota protegida
    try {
      const apiResponse = await fetch(`${backendUrl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔐 API protegida:', apiResponse.status, apiResponse.statusText);
      
      if (apiResponse.ok) {
        const users = await apiResponse.json();
        console.log('✅ Usuários carregados:', users.length, 'usuários');
      } else {
        const errorText = await apiResponse.text();
        console.log('❌ Erro na API:', errorText);
      }
    } catch (error) {
      console.log('❌ Erro ao chamar API:', error.message);
    }

    // 4. Testar logout
    console.log('\n4️⃣ Testando logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.log('❌ Erro no logout:', logoutError);
    } else {
      console.log('✅ Logout bem-sucedido!');
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

// Executar teste
testCompleteAuth().catch(console.error);
