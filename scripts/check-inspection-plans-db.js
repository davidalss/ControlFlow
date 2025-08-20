import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { inspectionPlans, inspectionPlanRevisions, inspectionPlanProducts } from '../shared/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL não encontrada no .env');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function checkInspectionPlansTables() {
  try {
    console.log('🔍 Verificando tabelas de planos de inspeção...');
    
    // Verificar se a tabela inspection_plans existe
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plans'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('❌ Tabela inspection_plans não encontrada');
      console.log('📋 Criando tabela inspection_plans...');
      
      // Criar a tabela inspection_plans
      await sql`
        CREATE TABLE IF NOT EXISTS inspection_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_code TEXT NOT NULL UNIQUE,
          plan_name TEXT NOT NULL,
          plan_type TEXT NOT NULL CHECK (plan_type IN ('product', 'parts')),
          version TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
          product_id UUID REFERENCES products(id),
          product_code TEXT,
          product_name TEXT NOT NULL,
          product_family TEXT,
          business_unit TEXT NOT NULL CHECK (business_unit IN ('DIY', 'TECH', 'KITCHEN_BEAUTY', 'MOTOR_COMFORT', 'N/A')),
          linked_products JSONB DEFAULT '[]',
          voltage_configuration JSONB DEFAULT '{}',
          inspection_type TEXT NOT NULL CHECK (inspection_type IN ('functional', 'graphic', 'dimensional', 'electrical', 'packaging', 'mixed')),
          aql_critical REAL DEFAULT 0,
          aql_major REAL DEFAULT 2.5,
          aql_minor REAL DEFAULT 4.0,
          sampling_method TEXT NOT NULL,
          inspection_level TEXT DEFAULT 'II' CHECK (inspection_level IN ('I', 'II', 'III')),
          inspection_steps TEXT NOT NULL,
          checklists TEXT NOT NULL,
          required_parameters TEXT NOT NULL,
          required_photos TEXT,
          questions_by_voltage JSONB DEFAULT '{}',
          labels_by_voltage JSONB DEFAULT '{}',
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
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      console.log('✅ Tabela inspection_plans criada com sucesso');
    } else {
      console.log('✅ Tabela inspection_plans já existe');
    }
    
    // Verificar se a tabela inspection_plan_revisions existe
    const revisionsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plan_revisions'
      );
    `;
    
    if (!revisionsTableExists[0].exists) {
      console.log('❌ Tabela inspection_plan_revisions não encontrada');
      console.log('📋 Criando tabela inspection_plan_revisions...');
      
      await sql`
        CREATE TABLE IF NOT EXISTS inspection_plan_revisions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES inspection_plans(id) ON DELETE CASCADE,
          revision_number INTEGER NOT NULL,
          revision_date TIMESTAMP DEFAULT NOW(),
          revision_reason TEXT,
          changes_description TEXT,
          approved_by UUID REFERENCES users(id),
          approved_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      console.log('✅ Tabela inspection_plan_revisions criada com sucesso');
    } else {
      console.log('✅ Tabela inspection_plan_revisions já existe');
    }
    
    // Verificar se a tabela inspection_plan_products existe
    const productsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inspection_plan_products'
      );
    `;
    
    if (!productsTableExists[0].exists) {
      console.log('❌ Tabela inspection_plan_products não encontrada');
      console.log('📋 Criando tabela inspection_plan_products...');
      
      await sql`
        CREATE TABLE IF NOT EXISTS inspection_plan_products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plan_id UUID NOT NULL REFERENCES inspection_plans(id) ON DELETE CASCADE,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          voltage_variant TEXT,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(plan_id, product_id, voltage_variant)
        );
      `;
      
      console.log('✅ Tabela inspection_plan_products criada com sucesso');
    } else {
      console.log('✅ Tabela inspection_plan_products já existe');
    }
    
    // Verificar se há dados na tabela
    const planCount = await sql`SELECT COUNT(*) as count FROM inspection_plans`;
    console.log(`📊 Total de planos de inspeção: ${planCount[0].count}`);
    
    console.log('🎉 Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar/criar tabelas:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

checkInspectionPlansTables().catch(console.error);
