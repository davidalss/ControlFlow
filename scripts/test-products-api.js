const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductsAPI() {
  console.log('=== TESTE DA API DE PRODUTOS ===');
  
  try {
    // 1. Verificar sessão atual
    console.log('\n1. Verificando sessão do Supabase...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ Nenhuma sessão ativa encontrada');
      console.log('💡 Faça login primeiro no frontend');
      return;
    }
    
    console.log('✅ Sessão encontrada:', {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: new Date(session.expires_at * 1000).toLocaleString()
    });
    
    // 2. Testar API sem token
    console.log('\n2. Testando API sem token...');
    try {
      const responseNoToken = await fetch('https://enso-backend-0aa1.onrender.com/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 Status sem token: ${responseNoToken.status}`);
      if (!responseNoToken.ok) {
        const errorText = await responseNoToken.text();
        console.log(`❌ Erro sem token: ${errorText}`);
      }
    } catch (error) {
      console.log('❌ Erro na requisição sem token:', error.message);
    }
    
    // 3. Testar API com token
    console.log('\n3. Testando API com token...');
    const token = session.access_token;
    console.log('🎫 Token presente:', !!token);
    console.log('🎫 Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    
    try {
      const responseWithToken = await fetch('https://enso-backend-0aa1.onrender.com/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`📊 Status com token: ${responseWithToken.status}`);
      
      if (responseWithToken.ok) {
        const products = await responseWithToken.json();
        console.log(`✅ API funcionando! Total de produtos: ${products.length}`);
        
        if (products.length > 0) {
          console.log('📋 Primeiros 3 produtos:');
          products.slice(0, 3).forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.code} - ${product.description}`);
          });
        }
      } else {
        const errorText = await responseWithToken.text();
        console.log(`❌ Erro com token: ${errorText}`);
      }
    } catch (error) {
      console.log('❌ Erro na requisição com token:', error.message);
    }
    
    // 4. Testar endpoint de health
    console.log('\n4. Testando endpoint de health...');
    try {
      const healthResponse = await fetch('https://enso-backend-0aa1.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 Health status: ${healthResponse.status}`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
      } else {
        const errorText = await healthResponse.text();
        console.log(`❌ Health check falhou: ${errorText}`);
      }
    } catch (error) {
      console.log('❌ Erro no health check:', error.message);
    }
    
    // 5. Verificar se há produtos no banco
    console.log('\n5. Verificando produtos no banco Supabase...');
    try {
      const { data: products, error: dbError } = await supabase
        .from('products')
        .select('id, code, description, category')
        .limit(5);
      
      if (dbError) {
        console.log('❌ Erro ao acessar tabela products:', dbError.message);
      } else {
        console.log(`✅ Produtos no banco: ${products?.length || 0}`);
        if (products && products.length > 0) {
          console.log('📋 Produtos no banco:');
          products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.code} - ${product.description}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar banco:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testProductsAPI().then(() => {
  console.log('\n=== TESTE CONCLUÍDO ===');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
