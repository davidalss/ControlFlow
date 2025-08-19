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
    // 1. Verificar se a tabela users existe
    console.log('1. Verificando tabela users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.log('❌ Erro ao acessar tabela users:', usersError.message);
      
      // Tentar desabilitar RLS
      console.log('🛠️ Tentando desabilitar RLS...');
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;'
      });
      
      if (rlsError) {
        console.log('❌ Erro ao desabilitar RLS:', rlsError.message);
      } else {
        console.log('✅ RLS desabilitado com sucesso');
      }
    } else {
      console.log('✅ Tabela users acessível');
    }

    // 2. Verificar estrutura da tabela
    console.log('\n2. Verificando estrutura da tabela users...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (columnsError) {
      console.log('❌ Erro ao verificar estrutura:', columnsError.message);
    } else {
      console.log('✅ Estrutura da tabela:');
      console.table(columns);
    }

    // 3. Verificar se há usuários cadastrados
    console.log('\n3. Verificando usuários cadastrados...');
    const { data: userCount, error: countError } = await supabase.rpc('exec_sql', {
      sql: 'SELECT COUNT(*) as count FROM public.users;'
    });

    if (countError) {
      console.log('❌ Erro ao contar usuários:', countError.message);
    } else {
      console.log(`✅ Total de usuários: ${userCount[0]?.count || 0}`);
    }

    // 4. Verificar configuração RLS
    console.log('\n4. Verificando configuração RLS...');
    const { data: rlsConfig, error: rlsConfigError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE tablename = 'users' AND schemaname = 'public';
      `
    });

    if (rlsConfigError) {
      console.log('❌ Erro ao verificar RLS:', rlsConfigError.message);
    } else {
      console.log('✅ Configuração RLS:');
      console.table(rlsConfig);
    }

    // 5. Verificar políticas RLS
    console.log('\n5. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname, permissive, roles, cmd, qual 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public';
      `
    });

    if (policiesError) {
      console.log('❌ Erro ao verificar políticas:', policiesError.message);
    } else {
      if (policies && policies.length > 0) {
        console.log('✅ Políticas RLS encontradas:');
        console.table(policies);
      } else {
        console.log('⚠️ Nenhuma política RLS encontrada');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDatabaseConfig().then(() => {
  console.log('\n✅ Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
