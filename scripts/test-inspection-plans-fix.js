const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInspectionPlansFix() {
  try {
    console.log('🔍 Testando correção dos planos de inspeção...');
    
    // 1. Testar endpoint GET /api/inspection-plans (listar todos)
    console.log('\n1. Testando GET /api/inspection-plans...');
    const apiUrl = 'https://enso-backend-0aa1.onrender.com';
    
    const listResponse = await fetch(`${apiUrl}/api/inspection-plans`);
    
    console.log(`📡 Status: ${listResponse.status}`);
    
    if (listResponse.ok) {
      const plans = await listResponse.json();
      console.log(`✅ Planos encontrados: ${plans.length}`);
      
      if (plans.length > 0) {
        const firstPlan = plans[0];
        console.log(`📋 Primeiro plano: ${firstPlan.plan_code} - ${firstPlan.plan_name}`);
        
        // 2. Testar endpoint GET /api/inspection-plans/:id (buscar plano específico)
        console.log(`\n2. Testando GET /api/inspection-plans/${firstPlan.id}...`);
        
        const detailResponse = await fetch(`${apiUrl}/api/inspection-plans/${firstPlan.id}`);
        
        console.log(`📡 Status: ${detailResponse.status}`);
        
        if (detailResponse.ok) {
          const planDetail = await detailResponse.json();
          console.log(`✅ Plano encontrado: ${planDetail.plan_code} - ${planDetail.plan_name}`);
          console.log('🎉 Problema resolvido! O endpoint GET /:id está funcionando corretamente.');
        } else {
          const errorText = await detailResponse.text();
          console.error(`❌ Erro ao buscar plano: ${errorText}`);
          console.log('❌ Problema ainda persiste.');
        }
      } else {
        console.log('⚠️ Nenhum plano encontrado para testar.');
      }
    } else {
      const errorText = await listResponse.text();
      console.error(`❌ Erro ao listar planos: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testInspectionPlansFix();
