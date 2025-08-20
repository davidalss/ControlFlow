const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: './env.production' });

async function fixInspectionPlansDatabase() {
  console.log('🔧 Verificando e corrigindo banco de dados de planos de inspeção...');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('🔗 DATABASE_URL encontrada:', connectionString ? 'Sim' : 'Não');
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL não encontrada no env.production');
    return;
  }

  const sql = postgres(connectionString);

  try {
    // 1. Verificar se a tabela existe
    console.log('📋 Verificando se a tabela inspection_plans existe...');
    
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.error('❌ Tabela inspection_plans não existe!');
      console.log('💡 Criando tabela inspection_plans...');
      
      // Criar tabela inspection_plans
      await sql`
        CREATE TABLE inspection_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_code TEXT NOT NULL UNIQUE,
          plan_name TEXT NOT NULL,
          plan_type TEXT NOT NULL,
          version TEXT NOT NULL,
          status TEXT DEFAULT 'draft' NOT NULL,
          product_id UUID REFERENCES products(id),
          product_code TEXT,
          product_name TEXT NOT NULL,
          product_family TEXT,
          business_unit TEXT NOT NULL,
          inspection_type TEXT NOT NULL,
          aql_critical REAL DEFAULT 0,
          aql_major REAL DEFAULT 2.5,
          aql_minor REAL DEFAULT 4.0,
          sampling_method TEXT NOT NULL,
          inspection_level TEXT DEFAULT 'II',
          inspection_steps TEXT NOT NULL,
          checklists TEXT NOT NULL,
          required_parameters TEXT NOT NULL,
          required_photos TEXT,
          label_file TEXT,
          manual_file TEXT,
          packaging_file TEXT,
          artwork_file TEXT,
          additional_files TEXT,
          created_by UUID NOT NULL REFERENCES users(id),
          approved_by UUID REFERENCES users(id),
          approved_at TIMESTAMP,
          observations TEXT,
          special_instructions TEXT,
          is_active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
        );
      `;
      
      console.log('✅ Tabela inspection_plans criada com sucesso!');
    } else {
      console.log('✅ Tabela inspection_plans já existe');
    }
    
    // 2. Verificar se a tabela inspection_plan_revisions existe
    console.log('📋 Verificando se a tabela inspection_plan_revisions existe...');
    
    const revisionsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plan_revisions'
      );
    `;
    
    if (!revisionsTableExists[0].exists) {
      console.log('💡 Criando tabela inspection_plan_revisions...');
      
      await sql`
        CREATE TABLE inspection_plan_revisions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES inspection_plans(id) ON DELETE CASCADE,
          revision INTEGER NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'archived')),
          changed_by UUID NOT NULL REFERENCES users(id),
          changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          changes JSONB DEFAULT '{}'
        );
      `;
      
      console.log('✅ Tabela inspection_plan_revisions criada com sucesso!');
    } else {
      console.log('✅ Tabela inspection_plan_revisions já existe');
    }
    
    // 3. Verificar e criar índices
    console.log('🔍 Verificando índices...');
    
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'inspection_plans';
    `;
    
    const existingIndexes = indexes.map(idx => idx.indexname);
    
    // Criar índices se não existirem
    if (!existingIndexes.includes('idx_inspection_plans_product_id')) {
      console.log('💡 Criando índice idx_inspection_plans_product_id...');
      await sql`CREATE INDEX idx_inspection_plans_product_id ON inspection_plans(product_id);`;
    }
    
    if (!existingIndexes.includes('idx_inspection_plans_status')) {
      console.log('💡 Criando índice idx_inspection_plans_status...');
      await sql`CREATE INDEX idx_inspection_plans_status ON inspection_plans(status);`;
    }
    
    if (!existingIndexes.includes('idx_inspection_plans_created_at')) {
      console.log('💡 Criando índice idx_inspection_plans_created_at...');
      await sql`CREATE INDEX idx_inspection_plans_created_at ON inspection_plans(created_at);`;
    }
    
    console.log('✅ Índices verificados/criados');
    
    // 4. Verificar permissões
    console.log('🔐 Verificando permissões...');
    
    const permissions = await sql`
      SELECT grantee, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_name = 'inspection_plans';
    `;
    
    console.log('   - Permissões encontradas:');
    permissions.forEach(perm => {
      console.log(`     * ${perm.grantee}: ${perm.privilege_type}`);
    });
    
    // 5. Verificar dados
    console.log('📈 Verificando dados na tabela...');
    
    const count = await sql`SELECT COUNT(*) as count FROM inspection_plans;`;
    console.log(`   - Total de registros: ${count[0].count}`);
    
    if (count[0].count > 0) {
      const sample = await sql`SELECT id, plan_code, plan_name, created_at FROM inspection_plans LIMIT 3;`;
      console.log('   - Amostra de registros:');
      sample.forEach(record => {
        console.log(`     * ${record.plan_code}: ${record.plan_name} (${record.created_at})`);
      });
    } else {
      console.log('   - Tabela vazia - isso é normal para um novo ambiente');
    }
    
    // 6. Verificar se há dados corrompidos
    console.log('🔍 Verificando integridade dos dados...');
    
    const corruptedData = await sql`
      SELECT id, plan_code, plan_name 
      FROM inspection_plans 
      WHERE plan_code IS NULL OR plan_name IS NULL OR product_name IS NULL;
    `;
    
    if (corruptedData.length > 0) {
      console.warn('⚠️  Dados corrompidos encontrados:');
      corruptedData.forEach(record => {
        console.warn(`     * ID: ${record.id} - Código: ${record.plan_code} - Nome: ${record.plan_name}`);
      });
    } else {
      console.log('✅ Nenhum dado corrompido encontrado');
    }
    
    console.log('✅ Verificação e correção concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar/corrigir banco de dados:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await sql.end();
  }
}

// Executar verificação e correção
fixInspectionPlansDatabase().catch(console.error);
