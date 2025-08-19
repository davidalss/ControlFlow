// Script para testar conexão com Supabase no ambiente Render
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Testando conexão com Supabase...\n');

// Verificar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log('📋 Variáveis de ambiente:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅ Configurada' : '❌ Não configurada');
console.log('DATABASE_URL:', databaseUrl ? '✅ Configurada' : '❌ Não configurada');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n❌ Variáveis do Supabase não configuradas!');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se consegue acessar a tabela users
    console.log('\n1. Testando acesso à tabela users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(1);

    if (usersError) {
      console.log('❌ Erro ao acessar users:', usersError.message);
    } else {
      console.log('✅ Tabela users acessível');
      console.log('📊 Usuários encontrados:', users?.length || 0);
    }

    // Teste 2: Verificar outras tabelas
    console.log('\n2. Testando outras tabelas...');
    const tables = ['products', 'logs', 'inspection_plans'];
    
    for (const table of tables) {
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

    // Teste 3: Verificar autenticação
    console.log('\n3. Testando autenticação...');
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

    console.log('\n✅ Teste de conexão concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection().then(() => {
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Se todos os testes passaram, o problema pode estar no middleware');
  console.log('2. Se algum teste falhou, verifique as variáveis de ambiente no Render');
  console.log('3. Execute este script no ambiente Render para confirmar');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
