import postgres from 'postgres';

const connectionString = "postgresql://postgres.smvohmdytczfouslcaju:W8CZhKe4B2jPcrQl@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

console.log('🔍 Testando conexão com Supabase...');
console.log('📋 URL:', connectionString);

try {
  const client = postgres(connectionString);
  
  console.log('✅ Cliente postgres criado');
  
  const result = await client`SELECT 1 as test`;
  console.log('✅ Query executada com sucesso:', result);
  
  await client.end();
  console.log('✅ Conexão fechada com sucesso');
  
} catch (error) {
  console.error('❌ Erro na conexão:', error.message);
  console.error('❌ Stack:', error.stack);
}
