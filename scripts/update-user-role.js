import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
// Mantemos compatibilidade com ambos nomes, sem alterar o app
dotenv.config({ path: join(__dirname, '../env.production') });

// Preferir VITE_SUPABASE_URL (usado pelo app), com fallback para SUPABASE_URL
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.error('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserRole() {
  const targetEmail = 'david.pedro@wap.ind.br';
  const newRole = 'admin';

  try {
    console.log('🔍 Procurando usuário:', targetEmail);
    
    // Primeiro, vamos verificar se o usuário existe
    const { data: users, error: searchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', targetEmail);

    if (searchError) {
      console.error('❌ Erro ao buscar usuário:', searchError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Usuário não encontrado:', targetEmail);
      console.log('📝 Criando usuário admin...');
      
      // Criar o usuário se não existir
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: targetEmail,
            name: 'David Pedro',
            role: newRole,
            businessUnit: 'N/A'
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar usuário:', createError);
        return;
      }

      console.log('✅ Usuário criado com sucesso!');
      console.log('📋 Detalhes do usuário:');
      console.log('   ID:', newUser.id);
      console.log('   Email:', newUser.email);
      console.log('   Nome:', newUser.name);
      console.log('   Role:', newUser.role);
      console.log('   Business Unit:', newUser.businessUnit);
      return;
    }

    const user = users[0];
    console.log('✅ Usuário encontrado!');
    console.log('📋 Detalhes atuais:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.name);
    console.log('   Role atual:', user.role);
    console.log('   Business Unit:', user.businessUnit);

    if (user.role === newRole) {
      console.log('ℹ️  Usuário já possui o role admin!');
      return;
    }

    console.log('🔄 Atualizando role para admin...');
    
    // Atualizar o role do usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar role:', updateError);
      return;
    }

    console.log('✅ Role atualizado com sucesso!');
    console.log('📋 Novos detalhes:');
    console.log('   ID:', updatedUser.id);
    console.log('   Email:', updatedUser.email);
    console.log('   Nome:', updatedUser.name);
    console.log('   Role:', updatedUser.role);
    console.log('   Business Unit:', updatedUser.businessUnit);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
console.log('🚀 Iniciando atualização de role...');
updateUserRole()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
