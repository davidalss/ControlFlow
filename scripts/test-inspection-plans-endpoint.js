const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInspectionPlansEndpoint() {
  try {
    console.log('🔍 Testando endpoint de planos de inspeção...');
    
    // 1. Testar login
    console.log('\n1. Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso');
    const token = authData.session.access_token;
    
    // 2. Testar endpoint GET /api/inspection-plans
    console.log('\n2. Testando GET /api/inspection-plans...');
    const apiUrl = 'https://enso-backend-0aa1.onrender.com';
    
    const listResponse = await fetch(`${apiUrl}/api/inspection-plans`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Status: ${listResponse.status}`);
    
    if (listResponse.ok) {
      const plans = await listResponse.json();
      console.log(`✅ Planos encontrados: ${plans.length}`);
      
      if (plans.length > 0) {
        const firstPlan = plans[0];
        console.log(`📋 Primeiro plano: ${firstPlan.plan_code} - ${firstPlan.plan_name}`);
        
        // 3. Testar endpoint GET /api/inspection-plans/:id
        console.log(`\n3. Testando GET /api/inspection-plans/${firstPlan.id}...`);
        
        const detailResponse = await fetch(`${apiUrl}/api/inspection-plans/${firstPlan.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📡 Status: ${detailResponse.status}`);
        
        if (detailResponse.ok) {
          const planDetail = await detailResponse.json();
          console.log(`✅ Plano encontrado: ${planDetail.plan_code} - ${planDetail.plan_name}`);
        } else {
          const errorText = await detailResponse.text();
          console.error(`❌ Erro ao buscar plano: ${errorText}`);
        }
      }
    } else {
      const errorText = await listResponse.text();
      console.error(`❌ Erro ao listar planos: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testInspectionPlansEndpoint();
