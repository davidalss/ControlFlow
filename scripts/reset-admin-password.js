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

async function resetAdminPassword() {
  const targetEmail = 'david.pedro@wap.ind.br';
  const newPassword = 'david.pedro@wap.ind.br';

  try {
    console.log('🔍 Buscando usuário no Supabase Auth...');
    
    // Buscar o usuário
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }

    const user = users.find(u => u.email === targetEmail);
    
    if (!user) {
      console.error('❌ Usuário não encontrado no Supabase Auth');
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Email Confirmado:', user.email_confirmed_at ? 'Sim' : 'Não');

    // Redefinir a senha
    console.log('\n🔄 Redefinindo senha...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Erro ao redefinir senha:', updateError);
      return;
    }

    console.log('✅ Senha redefinida com sucesso!');
    console.log('📋 Novos dados do usuário:');
    console.log('   ID:', updateData.user.id);
    console.log('   Email:', updateData.user.email);
    console.log('   Email Confirmado:', updateData.user.email_confirmed_at ? 'Sim' : 'Não');
    console.log('   Última Atualização:', updateData.user.updated_at);

    console.log('\n🎉 Senha redefinida com sucesso!');
    console.log('📋 Credenciais de acesso:');
    console.log('   Email:', targetEmail);
    console.log('   Senha:', newPassword);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
console.log('🚀 Iniciando redefinição de senha do usuário admin...');
resetAdminPassword()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
