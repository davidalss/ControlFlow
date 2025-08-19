#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

console.log('🔧 Resetando senha do usuário admin...\n');

// Configurações do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE';

console.log('📋 Configurações:');
console.log('URL:', supabaseUrl);
console.log('Service Key:', `${supabaseServiceKey.substring(0, 20)}...`);
console.log('');

// Criar cliente Supabase com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdminPassword() {
  const email = 'david.pedro@wap.ind.br';
  const newPassword = 'david.pedro@wap.ind.br';
  
  console.log(`🔄 Resetando senha para: ${email}`);
  
  try {
    // 1. Verificar se o usuário existe
    console.log('1️⃣ Verificando se o usuário existe...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ Usuário não encontrado. Criando novo usuário...');
      
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          name: 'David Pedro',
          role: 'admin'
        }
      });
      
      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError);
        return;
      }
      
      console.log('✅ Usuário criado com sucesso!');
      console.log('👤 ID:', newUser.user.id);
      console.log('📧 Email:', newUser.user.email);
      
    } else {
      console.log('✅ Usuário encontrado. Resetando senha...');
      console.log('👤 ID:', user.id);
      console.log('📧 Email:', user.email);
      
      // Resetar senha
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          password: newPassword,
          user_metadata: {
            name: 'David Pedro',
            role: 'admin'
          }
        }
      );
      
      if (updateError) {
        console.error('❌ Erro ao resetar senha:', updateError);
        return;
      }
      
      console.log('✅ Senha resetada com sucesso!');
      console.log('👤 Usuário atualizado:', updateData.user.email);
    }
    
    // 2. Testar login com a nova senha
    console.log('\n🧪 Testando login com a nova senha...');
    
    const testClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email,
      password: newPassword
    });
    
    if (loginError) {
      console.error('❌ Erro no teste de login:', loginError);
    } else {
      console.log('✅ Login de teste bem-sucedido!');
      console.log('👤 Usuário logado:', loginData.user.email);
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

resetAdminPassword().catch(console.error);
