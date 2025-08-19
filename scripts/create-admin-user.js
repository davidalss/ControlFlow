import postgres from 'postgres';
import bcrypt from 'bcrypt';

// Configuração do banco
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

async function createAdminUser() {
  console.log('👤 Criando usuário admin...');
  
  const email = 'david.pedro@wap.ind.br';
  const password = 'Wap@2025';
  const name = 'David Pedro';
  const role = 'admin';
  
  let client;
  
  try {
    client = postgres(connectionString);
    
    console.log('✅ Conectado ao banco de dados');
    
    // Verificar se o usuário já existe
    console.log('🔍 Verificando se o usuário já existe...');
    const existingUser = await client`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = ${email}
    `;
    
    if (existingUser.length > 0) {
      console.log('✅ Usuário já existe:');
      console.log('   ID:', existingUser[0].id);
      console.log('   Email:', existingUser[0].email);
      console.log('   Nome:', existingUser[0].name);
      console.log('   Role:', existingUser[0].role);
      
      // Atualizar para admin se não for
      if (existingUser[0].role !== 'admin') {
        console.log('🔄 Atualizando role para admin...');
        await client`
          UPDATE users 
          SET role = ${role} 
          WHERE email = ${email}
        `;
        console.log('✅ Role atualizada para admin');
      }
      
      return;
    }
    
    // Criar hash da senha
    console.log('🔐 Criando hash da senha...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Inserir usuário
    console.log('➕ Inserindo usuário no banco...');
    const result = await client`
      INSERT INTO users (email, password, name, role, business_unit)
      VALUES (${email}, ${hashedPassword}, ${name}, ${role}, 'N/A')
      RETURNING id, email, name, role
    `;
    
    const newUser = result[0];
    console.log('✅ Usuário criado com sucesso:');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Nome:', newUser.name);
    console.log('   Role:', newUser.role);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

async function main() {
  console.log('🚀 Iniciando criação do usuário admin...\n');
  await createAdminUser();
  console.log('\n🏁 Processo concluído');
}

main().catch(console.error);
