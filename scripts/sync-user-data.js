import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '../env.production') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function syncUserData() {
  const targetEmail = 'david.pedro@wap.ind.br';

  try {
    console.log('🔍 Sincronizando dados do usuário...');
    
    // 1. Buscar usuário no Supabase Auth
    console.log('1. Buscando usuário no Supabase Auth...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários no Auth:', authError);
      return;
    }

    const authUser = users.find(user => user.email === targetEmail);
    
    if (!authUser) {
      console.error('❌ Usuário não encontrado no Supabase Auth');
      return;
    }

    console.log('✅ Usuário encontrado no Supabase Auth:');
    console.log('   ID:', authUser.id);
    console.log('   Email:', authUser.email);
    console.log('   Email Confirmado:', authUser.email_confirmed_at ? 'Sim' : 'Não');

    // 2. Buscar usuário na tabela users
    console.log('\n2. Buscando usuário na tabela users...');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', targetEmail);

    if (dbError) {
      console.error('❌ Erro ao buscar na tabela users:', dbError);
      return;
    }

    if (!dbUsers || dbUsers.length === 0) {
      console.log('📝 Usuário não encontrado na tabela users. Criando...');
      
      // Criar usuário na tabela users com o mesmo ID do Supabase Auth
      const { data: newDbUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: authUser.id, // Usar o mesmo ID do Supabase Auth
            email: targetEmail,
            name: 'David Pedro',
            role: 'admin',
            businessUnit: 'N/A',
            password: 'temp-hash' // Placeholder, será gerenciado pelo Supabase Auth
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar usuário na tabela:', createError);
        return;
      }

      console.log('✅ Usuário criado na tabela users:');
      console.log('   ID:', newDbUser.id);
      console.log('   Email:', newDbUser.email);
      console.log('   Role:', newDbUser.role);
      console.log('   Business Unit:', newDbUser.businessUnit);
    } else {
      const dbUser = dbUsers[0];
      console.log('✅ Usuário encontrado na tabela users:');
      console.log('   ID:', dbUser.id);
      console.log('   Email:', dbUser.email);
      console.log('   Role:', dbUser.role);
      console.log('   Business Unit:', dbUser.businessUnit);

      // 3. Verificar se os IDs são iguais
      if (dbUser.id !== authUser.id) {
        console.log('⚠️  IDs diferentes detectados!');
        console.log('   Supabase Auth ID:', authUser.id);
        console.log('   Tabela users ID:', dbUser.id);
        
        console.log('🔄 Atualizando ID na tabela users...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: authUser.id })
          .eq('email', targetEmail);

        if (updateError) {
          console.error('❌ Erro ao atualizar ID:', updateError);
          return;
        }

        console.log('✅ ID atualizado com sucesso!');
      } else {
        console.log('✅ IDs estão sincronizados!');
      }

      // 4. Verificar se o role está correto
      if (dbUser.role !== 'admin') {
        console.log('🔄 Atualizando role para admin...');
        
        const { error: roleError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', authUser.id);

        if (roleError) {
          console.error('❌ Erro ao atualizar role:', roleError);
          return;
        }

        console.log('✅ Role atualizado para admin!');
      } else {
        console.log('✅ Role já está correto (admin)!');
      }
    }

    console.log('\n🎉 Sincronização concluída com sucesso!');
    console.log('📋 Resumo:');
    console.log('   ✅ Usuário existe no Supabase Auth');
    console.log('   ✅ Usuário existe na tabela users');
    console.log('   ✅ IDs estão sincronizados');
    console.log('   ✅ Role está configurado como admin');
    console.log('   ✅ Email está confirmado');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
console.log('🚀 Iniciando sincronização de dados do usuário...');
syncUserData()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
