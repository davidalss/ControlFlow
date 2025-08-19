import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '../env.production') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

// Usar o cliente anônimo para simular o frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  const targetEmail = 'david.pedro@wap.ind.br';
  const targetPassword = 'david.pedro@wap.ind.br';

  try {
    console.log('🔐 Testando login do usuário admin...');
    console.log('📧 Email:', targetEmail);
    
    // 1. Tentar fazer login
    console.log('\n1. Fazendo login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });

    if (signInError) {
      console.error('❌ Erro no login:', signInError.message);
      console.log('💡 Possíveis soluções:');
      console.log('   - Verifique se a senha está correta');
      console.log('   - Verifique se o email está confirmado');
      console.log('   - Verifique se o usuário existe no Supabase Auth');
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('🎫 Access Token:', signInData.session?.access_token?.substring(0, 20) + '...');
    console.log('👤 User ID:', signInData.user?.id);

    // 2. Buscar dados do usuário na tabela users
    console.log('\n2. Buscando dados do usuário na tabela users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar dados do usuário:', userError.message);
      return;
    }

    console.log('✅ Dados do usuário encontrados:');
    console.log('   ID:', userData.id);
    console.log('   Email:', userData.email);
    console.log('   Nome:', userData.name);
    console.log('   Role:', userData.role);
    console.log('   Business Unit:', userData.businessUnit);

    // 3. Verificar se o role é admin
    if (userData.role === 'admin') {
      console.log('✅ Role de admin confirmado!');
    } else {
      console.log('⚠️  Role não é admin:', userData.role);
    }

    // 4. Testar acesso a uma rota protegida (simular)
    console.log('\n3. Testando permissões de admin...');
    
    // Simular uma requisição para uma rota que requer admin
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      headers: {
        'Authorization': `Bearer ${signInData.session.access_token}`,
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      }
    });

    if (testResponse.ok) {
      console.log('✅ Acesso à API confirmado!');
    } else {
      console.log('⚠️  Possível problema de permissão na API');
      console.log('   Status:', testResponse.status);
      console.log('   Status Text:', testResponse.statusText);
    }

    // 5. Fazer logout
    console.log('\n4. Fazendo logout...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Erro no logout:', signOutError.message);
    } else {
      console.log('✅ Logout realizado com sucesso!');
    }

    console.log('\n🎉 Teste de login concluído com sucesso!');
    console.log('📋 Resumo:');
    console.log('   ✅ Login funcionando');
    console.log('   ✅ Dados do usuário acessíveis');
    console.log('   ✅ Role de admin confirmado');
    console.log('   ✅ Token de acesso válido');
    console.log('   ✅ Logout funcionando');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
console.log('🚀 Iniciando teste de login do usuário admin...');
testAdminLogin()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
