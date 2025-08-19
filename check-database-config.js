// Script para verificar configuração do banco de dados
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkDatabaseConfig() {
  console.log('🔍 Verificando configuração do banco de dados...\n');

  try {
    // 1. Verificar se a tabela users existe e é acessível
    console.log('1. Verificando tabela users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(1);

    if (usersError) {
      console.log('❌ Erro ao acessar tabela users:', usersError.message);
      console.log('🔧 Este erro indica que o RLS (Row Level Security) está bloqueando o acesso');
      console.log('💡 Solução: Execute o script SQL no Supabase SQL Editor');
      
      // Tentar uma query mais simples para verificar se é problema de RLS
      console.log('\n🔄 Tentando query simples...');
      const { data: simpleTest, error: simpleError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
        
      if (simpleError) {
        console.log('❌ Confirmação: RLS está bloqueando todas as queries');
      }
    } else {
      console.log('✅ Tabela users acessível');
      console.log(`📊 Usuários encontrados: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('👤 Exemplo de usuário:', users[0]);
      }
    }

    // 2. Verificar outras tabelas importantes
    console.log('\n2. Verificando outras tabelas...');
    
    const tablesToCheck = ['products', 'logs', 'inspection_plans'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
          
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: acessível`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: erro inesperado`);
      }
    }

    // 3. Verificar configuração do cliente Supabase
    console.log('\n3. Verificando configuração do Supabase...');
    console.log('🔗 URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
    console.log('🔑 Service Role Key:', supabaseServiceRoleKey ? '✅ Configurada' : '❌ Não configurada');

    // 4. Teste de autenticação
    console.log('\n4. Testando autenticação...');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.log('❌ Erro de autenticação:', authError.message);
      } else {
        console.log('✅ Autenticação funcionando');
      }
    } catch (err) {
      console.log('❌ Erro ao testar autenticação');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDatabaseConfig().then(() => {
  console.log('\n✅ Verificação concluída');
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Acesse o Supabase Dashboard');
  console.log('2. Vá para SQL Editor');
  console.log('3. Execute o script fix-supabase-rls.sql');
  console.log('4. Reinicie o servidor');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
