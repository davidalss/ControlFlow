import postgres from 'postgres';

// Configuração do banco
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.smvohmdytczfouslcaju:ExieAFZE1Xb3oyfh@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

async function applyVoltageMigration() {
  console.log('🔧 Aplicando migração das colunas de voltagem...');
  
  let client;
  
  try {
    client = postgres(connectionString);
    
    console.log('✅ Conectado ao banco de dados');
    
    // Verificar se as colunas já existem
    console.log('🔍 Verificando se as colunas já existem...');
    const columnsCheck = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('voltage_variants', 'voltage_type', 'is_multi_voltage')
    `;
    
    const existingColumns = columnsCheck.map(row => row.column_name);
    console.log('📋 Colunas existentes:', existingColumns);
    
    // Adicionar colunas que não existem
    if (!existingColumns.includes('voltage_variants')) {
      console.log('➕ Adicionando coluna voltage_variants...');
      await client`ALTER TABLE "products" ADD COLUMN "voltage_variants" jsonb DEFAULT '[]'`;
      console.log('✅ Coluna voltage_variants adicionada');
    }
    
    if (!existingColumns.includes('voltage_type')) {
      console.log('➕ Adicionando coluna voltage_type...');
      await client`ALTER TABLE "products" ADD COLUMN "voltage_type" text DEFAULT '127V'`;
      console.log('✅ Coluna voltage_type adicionada');
    }
    
    if (!existingColumns.includes('is_multi_voltage')) {
      console.log('➕ Adicionando coluna is_multi_voltage...');
      await client`ALTER TABLE "products" ADD COLUMN "is_multi_voltage" boolean DEFAULT false`;
      console.log('✅ Coluna is_multi_voltage adicionada');
    }
    
    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

async function main() {
  console.log('🚀 Iniciando aplicação da migração...\n');
  await applyVoltageMigration();
  console.log('\n🏁 Processo concluído');
}

main().catch(console.error);
