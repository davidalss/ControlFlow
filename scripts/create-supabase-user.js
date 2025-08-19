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
  console.error('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createSupabaseUser() {
  const targetEmail = 'david.pedro@wap.ind.br';
  const targetPassword = 'david.pedro@wap.ind.br';

  try {
    console.log('🔍 Verificando se o usuário existe no Supabase Auth...');
    
    // Primeiro, vamos verificar se o usuário já existe no Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }

    const existingUser = users.find(user => user.email === targetEmail);
    
    if (existingUser) {
      console.log('✅ Usuário já existe no Supabase Auth!');
      console.log('📋 Detalhes do usuário:');
      console.log('   ID:', existingUser.id);
      console.log('   Email:', existingUser.email);
      console.log('   Email Confirmado:', existingUser.email_confirmed_at ? 'Sim' : 'Não');
      console.log('   Criado em:', existingUser.created_at);
      
      // Se o email não estiver confirmado, vamos confirmá-lo
      if (!existingUser.email_confirmed_at) {
        console.log('🔄 Confirmando email do usuário...');
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error('❌ Erro ao confirmar email:', confirmError);
        } else {
          console.log('✅ Email confirmado com sucesso!');
        }
      }
      
      return;
    }

    console.log('📝 Usuário não encontrado no Supabase Auth. Criando...');
    
    // Criar o usuário no Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: 'David Pedro'
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário no Supabase Auth:', createError);
      return;
    }

    console.log('✅ Usuário criado com sucesso no Supabase Auth!');
    console.log('📋 Detalhes do usuário:');
    console.log('   ID:', newUser.user.id);
    console.log('   Email:', newUser.user.email);
    console.log('   Email Confirmado:', newUser.user.email_confirmed_at ? 'Sim' : 'Não');
    console.log('   Criado em:', newUser.user.created_at);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
console.log('🚀 Iniciando criação de usuário no Supabase Auth...');
createSupabaseUser()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
