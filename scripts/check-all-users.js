import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllUsers() {
  try {
    console.log('🔍 Verificando todos os usuários no banco de dados...\n');

    // Verificar usuários na tabela users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }

    console.log(`📊 Total de usuários na tabela 'users': ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n👥 Usuários encontrados:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('❌ Nenhum usuário encontrado na tabela users');
    }

    // Verificar usuários na tabela auth.users do Supabase
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Erro ao buscar usuários de autenticação:', authError);
      return;
    }

    console.log(`\n🔐 Total de usuários na tabela 'auth.users': ${authUsers.users.length}`);
    
    if (authUsers.users.length > 0) {
      console.log('\n👤 Usuários de autenticação:');
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ID: ${user.id} - Status: ${user.user_metadata?.status || 'active'}`);
      });
    }

    // Verificar grupos
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*');

    if (groupsError) {
      console.error('❌ Erro ao buscar grupos:', groupsError);
      return;
    }

    console.log(`\n👥 Total de grupos: ${groups.length}`);
    
    if (groups.length > 0) {
      console.log('\n🏷️ Grupos encontrados:');
      groups.forEach((group, index) => {
        console.log(`${index + 1}. ${group.name} - ${group.description || 'Sem descrição'}`);
      });
    }

    // Verificar membros de grupos
    const { data: groupMembers, error: membersError } = await supabase
      .from('group_members')
      .select('*');

    if (membersError) {
      console.error('❌ Erro ao buscar membros de grupos:', membersError);
      return;
    }

    console.log(`\n👤 Total de membros em grupos: ${groupMembers.length}`);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkAllUsers();
