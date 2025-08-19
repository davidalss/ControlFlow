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

async function syncUsersWithSupabase() {
  try {
    console.log('🔄 Iniciando sincronização de usuários...\n');

    // 1. Buscar todos os usuários da tabela users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');

    if (dbError) {
      console.error('❌ Erro ao buscar usuários da tabela users:', dbError);
      return;
    }

    console.log(`📊 Usuários na tabela 'users': ${dbUsers.length}`);

    // 2. Buscar todos os usuários da tabela auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Erro ao buscar usuários de autenticação:', authError);
      return;
    }

    console.log(`🔐 Usuários na tabela 'auth.users': ${authUsers.users.length}`);

    // 3. Criar um mapa dos usuários de autenticação por email
    const authUsersMap = new Map();
    authUsers.users.forEach(user => {
      if (user.email) {
        authUsersMap.set(user.email.toLowerCase(), user);
      }
    });

    // 4. Verificar quais usuários da tabela users não existem na auth.users
    const usersToCreateInAuth = [];
    const usersToUpdateInAuth = [];

    for (const dbUser of dbUsers) {
      const authUser = authUsersMap.get(dbUser.email.toLowerCase());
      
      if (!authUser) {
        // Usuário existe na tabela users mas não na auth.users
        usersToCreateInAuth.push(dbUser);
      } else {
        // Verificar se os dados estão sincronizados
        if (authUser.user_metadata?.name !== dbUser.name || 
            authUser.user_metadata?.role !== dbUser.role) {
          usersToUpdateInAuth.push({ dbUser, authUser });
        }
      }
    }

    // 5. Verificar quais usuários da auth.users não existem na tabela users
    const authUsersToCreateInDb = [];
    for (const authUser of authUsers.users) {
      if (!authUser.email) continue;
      
      const dbUser = dbUsers.find(u => u.email.toLowerCase() === authUser.email.toLowerCase());
      if (!dbUser) {
        authUsersToCreateInDb.push(authUser);
      }
    }

    console.log('\n📋 Resumo da sincronização:');
    console.log(`- Usuários para criar na auth.users: ${usersToCreateInAuth.length}`);
    console.log(`- Usuários para atualizar na auth.users: ${usersToUpdateInAuth.length}`);
    console.log(`- Usuários para criar na tabela users: ${authUsersToCreateInDb.length}`);

    // 6. Criar usuários na auth.users
    if (usersToCreateInAuth.length > 0) {
      console.log('\n🆕 Criando usuários na auth.users...');
      for (const user of usersToCreateInAuth) {
        try {
          const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: 'temp123456', // Senha temporária
            email_confirm: true,
            user_metadata: {
              name: user.name,
              role: user.role,
              business_unit: user.businessUnit || 'N/A'
            }
          });

          if (error) {
            console.error(`❌ Erro ao criar usuário ${user.email}:`, error.message);
          } else {
            console.log(`✅ Usuário ${user.email} criado na auth.users`);
          }
        } catch (error) {
          console.error(`❌ Erro ao criar usuário ${user.email}:`, error.message);
        }
      }
    }

    // 7. Atualizar usuários na auth.users
    if (usersToUpdateInAuth.length > 0) {
      console.log('\n🔄 Atualizando usuários na auth.users...');
      for (const { dbUser, authUser } of usersToUpdateInAuth) {
        try {
          const { data, error } = await supabase.auth.admin.updateUserById(
            authUser.id,
            {
              user_metadata: {
                name: dbUser.name,
                role: dbUser.role,
                business_unit: dbUser.businessUnit || 'N/A'
              }
            }
          );

          if (error) {
            console.error(`❌ Erro ao atualizar usuário ${dbUser.email}:`, error.message);
          } else {
            console.log(`✅ Usuário ${dbUser.email} atualizado na auth.users`);
          }
        } catch (error) {
          console.error(`❌ Erro ao atualizar usuário ${dbUser.email}:`, error.message);
        }
      }
    }

    // 8. Criar usuários na tabela users
    if (authUsersToCreateInDb.length > 0) {
      console.log('\n🆕 Criando usuários na tabela users...');
      for (const authUser of authUsersToCreateInDb) {
        try {
          const { data, error } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || authUser.email,
              role: authUser.user_metadata?.role || 'inspector',
              businessUnit: authUser.user_metadata?.business_unit || 'N/A',
              password: 'temp123456' // Senha temporária
            });

          if (error) {
            console.error(`❌ Erro ao criar usuário ${authUser.email} na tabela users:`, error.message);
          } else {
            console.log(`✅ Usuário ${authUser.email} criado na tabela users`);
          }
        } catch (error) {
          console.error(`❌ Erro ao criar usuário ${authUser.email} na tabela users:`, error.message);
        }
      }
    }

    console.log('\n✅ Sincronização concluída!');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('- Usuários criados na auth.users receberam senha temporária: temp123456');
    console.log('- Recomenda-se que os usuários alterem suas senhas no primeiro login');
    console.log('- Verifique se todos os usuários estão sincronizados corretamente');

  } catch (error) {
    console.error('❌ Erro inesperado durante a sincronização:', error);
  }
}

syncUsersWithSupabase();
