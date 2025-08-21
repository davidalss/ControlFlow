const baseUrl = process.env.VITE_API_URL || "https://enso-backend-0aa1.onrender.com";

const endpoints = [
  "/api/health",
  "/api/auth/me",
  "/api/products",
  "/api/products/search?q=test",
  "/api/categories",
  "/api/users/profile",
  "/api/sgq/rnc",
  "/api/inspection-plans",
  "/api/notifications",
  "/api/websocket/status"
];

console.log('🔍 VERIFICANDO ENDPOINTS DA API');
console.log('📍 Base URL:', baseUrl);
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('');

(async () => {
  let totalEndpoints = endpoints.length;
  let successCount = 0;
  let errorCount = 0;
  let authRequiredCount = 0;

  for (const path of endpoints) {
    const url = `${baseUrl}${path}`;
    console.log(`📡 Testando: ${path}`);
    
    try {
      const startTime = Date.now();
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ControlFlow-API-Check/1.0'
        }
      });
      const duration = Date.now() - startTime;
      
      const status = res.status;
      const statusText = res.statusText;
      const contentType = res.headers.get("content-type") || '';
      
      console.log(`   Status: ${status} ${statusText}`);
      console.log(`   Tempo: ${duration}ms`);
      console.log(`   Content-Type: ${contentType}`);
      
      if (status === 200) {
        successCount++;
        console.log(`   ✅ SUCESSO`);
        
        if (contentType.includes("application/json")) {
          try {
            const data = await res.json();
            if (Array.isArray(data)) {
              console.log(`   📊 Array com ${data.length} itens`);
              if (data.length > 0) {
                console.log(`   📋 Primeiro item:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
              }
            } else if (typeof data === 'object') {
              console.log(`   📋 Resposta:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
            }
          } catch (parseError) {
            console.log(`   ⚠️  Erro ao parsear JSON: ${parseError.message}`);
          }
        } else {
          const text = await res.text();
          console.log(`   📄 Texto: ${text.substring(0, 100)}...`);
        }
      } else if (status === 401) {
        authRequiredCount++;
        console.log(`   🔐 AUTENTICAÇÃO REQUERIDA`);
        try {
          const errorData = await res.text();
          console.log(`   📄 Erro: ${errorData.substring(0, 200)}...`);
        } catch (e) {
          console.log(`   📄 Erro: Não foi possível ler resposta`);
        }
      } else if (status === 404) {
        errorCount++;
        console.log(`   ❌ ENDPOINT NÃO ENCONTRADO`);
        try {
          const errorData = await res.text();
          console.log(`   📄 Erro: ${errorData.substring(0, 200)}...`);
        } catch (e) {
          console.log(`   📄 Erro: Não foi possível ler resposta`);
        }
      } else if (status >= 500) {
        errorCount++;
        console.log(`   💥 ERRO DO SERVIDOR`);
        try {
          const errorData = await res.text();
          console.log(`   📄 Erro: ${errorData.substring(0, 200)}...`);
        } catch (e) {
          console.log(`   📄 Erro: Não foi possível ler resposta`);
        }
      } else {
        errorCount++;
        console.log(`   ⚠️  STATUS INESPERADO`);
        try {
          const errorData = await res.text();
          console.log(`   📄 Resposta: ${errorData.substring(0, 200)}...`);
        } catch (e) {
          console.log(`   📄 Resposta: Não foi possível ler`);
        }
      }
      
    } catch (err) {
      errorCount++;
      console.log(`   💥 ERRO DE REDE: ${err.message}`);
    }
    
    console.log('');
  }

  // Resumo final
  console.log('📊 RESUMO DA VERIFICAÇÃO');
  console.log('========================');
  console.log(`Total de endpoints: ${totalEndpoints}`);
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`🔐 Auth requerida: ${authRequiredCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log('');
  
  if (errorCount > 0) {
    console.log('🚨 PROBLEMAS IDENTIFICADOS:');
    console.log('- Endpoints com erro podem estar quebrados');
    console.log('- Endpoints com 401 precisam de autenticação');
    console.log('- Verifique os logs do backend para mais detalhes');
  } else {
    console.log('✅ TODOS OS ENDPOINTS ESTÃO FUNCIONANDO!');
  }
  
  console.log('');
  console.log('💡 PRÓXIMOS PASSOS:');
  console.log('1. Se /api/products retorna 401 → problema de autenticação');
  console.log('2. Se /api/products retorna 404 → endpoint não existe');
  console.log('3. Se /api/products retorna 200 mas vazio → problema na query');
  console.log('4. Teste com token de autenticação para endpoints protegidos');

})();
