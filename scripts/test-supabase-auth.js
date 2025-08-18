#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testando autenticação do Supabase...');

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('Verifique se você tem:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_ANON_KEY');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente anônimo (frontend)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Cliente service role (backend)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testAuth() {
  try {
    console.log('📡 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se conseguimos conectar
    const { data: { user }, error } = await supabaseService.auth.getUser();
    
    if (error) {
      console.log('⚠️  Erro ao conectar (normal se não há usuário logado):', error.message);
    } else {
      console.log('✅ Conexão com Supabase estabelecida');
    }

    // Teste 2: Verificar se podemos criar um usuário de teste
    console.log('\n🧪 Testando criação de usuário...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.log('⚠️  Erro ao criar usuário:', signUpError.message);
      console.log('Isso pode ser normal se o email confirmation estiver ativado');
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('📧 Email:', testEmail);
      console.log('🔑 Senha:', testPassword);
      
      // Teste 3: Fazer login com o usuário criado
      console.log('\n🔐 Testando login...');
      
      const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        console.log('❌ Erro no login:', signInError.message);
      } else {
        console.log('✅ Login realizado com sucesso!');
        console.log('🎫 Access Token:', signInData.session?.access_token?.substring(0, 20) + '...');
        
        // Teste 4: Validar token com service role
        console.log('\n🔍 Testando validação de token...');
        
        const { data: validateData, error: validateError } = await supabaseService.auth.getUser(
          signInData.session.access_token
        );

        if (validateError) {
          console.log('❌ Erro na validação:', validateError.message);
        } else {
          console.log('✅ Token validado com sucesso!');
          console.log('👤 Usuário ID:', validateData.user?.id);
          console.log('📧 Email:', validateData.user?.email);
        }
      }
    }

    console.log('\n🎉 Teste de autenticação concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure o frontend para usar @supabase/supabase-js');
    console.log('2. Use o token do login nas chamadas à API');
    console.log('3. O backend já está configurado para validar tokens do Supabase');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testAuth();
