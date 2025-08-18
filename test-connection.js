import postgres from 'postgres';

// Teste com diferentes strings de conexão
const connectionStrings = [
  'postgresql://postgres.smvohmdytczfouslcaju:Dexter300819@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres:Dexter300819@db.smvohmdytczfouslcaju.supabase.co:5432/postgres',
  'postgresql://postgres.smvohmdytczfouslcaju:Dexter300819@db.smvohmdytczfouslcaju.supabase.co:5432/postgres'
];

async function testConnection(connectionString, name) {
  console.log(`\n🔍 Testando: ${name}`);
  console.log(`📡 String: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
  
  try {
    const client = postgres(connectionString);
    const result = await client`SELECT version()`;
    console.log('✅ Conexão bem-sucedida!');
    console.log(`📊 Versão: ${result[0].version}`);
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testando diferentes strings de conexão...');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], `String ${i + 1}`);
    if (success) {
      console.log(`\n🎉 String ${i + 1} funcionou! Use esta string no seu .env`);
      break;
    }
  }
}

runTests();
