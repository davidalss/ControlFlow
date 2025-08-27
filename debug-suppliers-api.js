// Script para debugar o problema da API de fornecedores
// Execute este script no console do navegador

console.log('🔍 Debugando API de fornecedores...');

async function debugSuppliersAPI() {
  try {
    // 1. Verificar se o servidor está respondendo
    console.log('1️⃣ Verificando servidor...');
    const healthResponse = await fetch('http://localhost:5002/health');
    console.log('🏥 Servidor:', healthResponse.status === 200 ? 'Online' : 'Erro');
    
    // 2. Verificar se há token de autenticação
    console.log('2️⃣ Verificando autenticação...');
    const token = localStorage.getItem('supabase.auth.token') || 
                  sessionStorage.getItem('supabase.auth.token');
    
    if (!token) {
      console.log('❌ Token não encontrado');
      return;
    }
    
    console.log('✅ Token encontrado');
    
    // 3. Testar API com diferentes headers
    console.log('3️⃣ Testando API com diferentes configurações...');
    
    // Teste 1: Headers básicos
    console.log('📡 Teste 1: Headers básicos');
    const response1 = await fetch('http://localhost:5002/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response1.status);
    console.log('Headers:', Object.fromEntries(response1.headers.entries()));
    
    if (!response1.ok) {
      const error1 = await response1.text();
      console.log('Erro:', error1);
    } else {
      const data1 = await response1.json();
      console.log('Sucesso:', data1);
    }
    
    // Teste 2: Sem Content-Type
    console.log('📡 Teste 2: Sem Content-Type');
    const response2 = await fetch('http://localhost:5002/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status:', response2.status);
    
    if (!response2.ok) {
      const error2 = await response2.text();
      console.log('Erro:', error2);
    } else {
      const data2 = await response2.json();
      console.log('Sucesso:', data2);
    }
    
    // Teste 3: Com query parameters
    console.log('📡 Teste 3: Com query parameters');
    const response3 = await fetch('http://localhost:5002/api/suppliers?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response3.status);
    
    if (!response3.ok) {
      const error3 = await response3.text();
      console.log('Erro:', error3);
    } else {
      const data3 = await response3.json();
      console.log('Sucesso:', data3);
    }
    
    // 4. Verificar se outras APIs funcionam
    console.log('4️⃣ Testando outras APIs...');
    
    const productsResponse = await fetch('http://localhost:5002/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Products:', productsResponse.status);
    
    const statsResponse = await fetch('http://localhost:5002/api/suppliers/stats/overview', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Stats:', statsResponse.status);
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
  }
}

// Função para testar com token específico
async function testWithSpecificToken(token) {
  console.log('🧪 Testando com token específico...');
  
  try {
    const response = await fetch('http://localhost:5002/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sucesso:', data);
    } else {
      const error = await response.text();
      console.log('❌ Erro:', error);
      
      // Tentar fazer parse do erro
      try {
        const errorJson = JSON.parse(error);
        console.log('❌ Erro detalhado:', errorJson);
      } catch {
        console.log('❌ Erro em texto:', error);
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Função para verificar logs do servidor
function checkServerLogs() {
  console.log('📋 Verificando logs do servidor...');
  console.log('💡 Dica: Verifique o terminal onde o servidor está rodando para ver logs detalhados do erro 500');
  console.log('💡 O erro pode estar relacionado a:');
  console.log('   - Problemas na conexão com o banco de dados');
  console.log('   - Erro na query SQL');
  console.log('   - Problemas no schema do Drizzle');
  console.log('   - Erro na autenticação do Supabase');
}

// Executar debug
console.log('🚀 Iniciando debug completo...');
debugSuppliersAPI();
checkServerLogs();

// Expor funções para uso manual
window.debugSuppliersAPI = debugSuppliersAPI;
window.testWithSpecificToken = testWithSpecificToken;
window.checkServerLogs = checkServerLogs;

console.log('🛠️ Funções disponíveis:');
console.log('- debugSuppliersAPI(): Debug completo da API');
console.log('- testWithSpecificToken(token): Testar com token específico');
console.log('- checkServerLogs(): Verificar logs do servidor');
