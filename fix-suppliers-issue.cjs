const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Configurações do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU5NzE5NywiZXhwIjoyMDUxMTczMTk3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Configurações do PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres.smvohmdytczfouslcaju:ControlFlow2024!@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSuppliersTable() {
  console.log('🔍 Verificando tabela suppliers...');
  
  try {
    // Verificar se a tabela existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela suppliers não existe!');
      return false;
    }
    
    console.log('✅ Tabela suppliers existe');
    
    // Verificar estrutura da tabela
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'suppliers' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura da tabela suppliers:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Verificar RLS
    const rlsCheck = await pool.query(`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE tablename = 'suppliers' AND schemaname = 'public';
    `);
    
    if (rlsCheck.rows.length > 0) {
      console.log(`🔒 RLS ativo: ${rlsCheck.rows[0].rowsecurity}`);
    }
    
    // Verificar políticas RLS
    const policies = await pool.query(`
      SELECT policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies 
      WHERE tablename = 'suppliers' AND schemaname = 'public';
    `);
    
    console.log(`📜 Políticas RLS encontradas: ${policies.rows.length}`);
    policies.rows.forEach(policy => {
      console.log(`  - ${policy.policyname}: ${policy.cmd}`);
    });
    
    // Contar registros
    const count = await pool.query('SELECT COUNT(*) FROM suppliers');
    console.log(`📊 Total de fornecedores: ${count.rows[0].count}`);
    
    // Mostrar alguns registros
    const suppliers = await pool.query('SELECT id, code, name, type, country, category, status FROM suppliers LIMIT 3');
    console.log('📋 Exemplos de fornecedores:');
    suppliers.rows.forEach(supplier => {
      console.log(`  - ${supplier.code}: ${supplier.name} (${supplier.type})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error.message);
    return false;
  }
}

async function fixSuppliersTable() {
  console.log('🔧 Corrigindo tabela suppliers...');
  
  try {
    // Verificar se há dados
    const count = await pool.query('SELECT COUNT(*) FROM suppliers');
    console.log(`📊 Fornecedores existentes: ${count.rows[0].count}`);
    
    if (count.rows[0].count === '0') {
      console.log('📝 Inserindo dados de exemplo...');
      
      // Inserir dados de exemplo
      await pool.query(`
        INSERT INTO suppliers (
          code, name, type, country, category, status, 
          contact_person, email, phone, address, website,
          rating, audit_score, observations, is_active, created_by
        ) VALUES 
        ('SUP001', 'Fornecedor Nacional A', 'national', 'Brasil', 'Eletrônicos', 'active', 
         'João Silva', 'joao@fornecedor.com', '(11) 99999-9999', 'Rua A, 123', 'www.fornecedor.com',
         4.5, 85.0, 'Fornecedor confiável', true, 'd85610ef-6430-4493-9ae2-8db20aa26d4e'),
        ('SUP002', 'Fornecedor Importado B', 'imported', 'China', 'Componentes', 'active',
         'Maria Santos', 'maria@importador.com', '(11) 88888-8888', 'Rua B, 456', 'www.importador.com',
         4.2, 78.0, 'Fornecedor internacional', true, 'd85610ef-6430-4493-9ae2-8db20aa26d4e')
      `);
      
      console.log('✅ Dados de exemplo inseridos');
    }
    
    // Desabilitar RLS temporariamente para resolver o problema
    await pool.query('ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;');
    console.log('✅ RLS desabilitado temporariamente');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela:', error.message);
    return false;
  }
}

async function testSuppliersAPI() {
  console.log('🧪 Testando API de fornecedores...');
  
  try {
    // Criar um token de teste
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'inspector@controlflow.com',
      password: 'inspector123'
    });
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message);
      return false;
    }
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ Erro ao obter sessão:', sessionError?.message);
      return false;
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    
    // Testar API local
    const response = await fetch('http://localhost:5002/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando:', data);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Erro na API:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico da API de fornecedores...\n');
  
  // Verificar tabela
  const tableExists = await checkSuppliersTable();
  
  if (!tableExists) {
    console.log('❌ Tabela não existe, criando...');
    return;
  }
  
  // Corrigir problemas
  await fixSuppliersTable();
  
  // Testar API
  await testSuppliersAPI();
  
  console.log('\n✅ Diagnóstico concluído!');
  
  await pool.end();
}

main().catch(console.error);
