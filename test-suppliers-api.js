// Script para testar a API de fornecedores
// Execute este script no console do navegador

console.log('🧪 Testando API de fornecedores...');

async function testSuppliersAPI() {
  try {
    // Obter token do localStorage ou sessionStorage
    const token = localStorage.getItem('supabase.auth.token') || 
                  sessionStorage.getItem('supabase.auth.token');
    
    if (!token) {
      console.log('❌ Token não encontrado. Faça login primeiro.');
      return;
    }
    
    console.log('✅ Token encontrado');
    
    // Testar API
    const response = await fetch('http://localhost:5002/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando:', data);
      
      if (data.suppliers) {
        console.log(`📊 Total de fornecedores: ${data.suppliers.length}`);
        data.suppliers.forEach((supplier, index) => {
          console.log(`  ${index + 1}. ${supplier.code}: ${supplier.name}`);
        });
      }
    } else {
      const error = await response.text();
      console.error('❌ Erro na API:', error);
      
      // Tentar fazer parse do erro como JSON
      try {
        const errorJson = JSON.parse(error);
        console.error('❌ Detalhes do erro:', errorJson);
      } catch {
        console.error('❌ Erro em texto:', error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

// Função para testar com token específico
async function testWithToken(token) {
  console.log('🧪 Testando com token específico...');
  
  try {
    const response = await fetch('http://localhost:5002/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sucesso:', data);
    } else {
      const error = await response.text();
      console.error('❌ Erro:', error);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Função para verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5002/health');
    console.log('🏥 Servidor:', response.status === 200 ? 'Online' : 'Erro');
  } catch (error) {
    console.log('🏥 Servidor: Offline');
  }
}

// Executar testes
console.log('🚀 Iniciando testes...');
checkServer();
testSuppliersAPI();

// Expor funções para uso manual
window.testSuppliersAPI = testSuppliersAPI;
window.testWithToken = testWithToken;
window.checkServer = checkServer;

console.log('🛠️ Funções disponíveis:');
console.log('- testSuppliersAPI(): Testar API com token atual');
console.log('- testWithToken(token): Testar com token específico');
console.log('- checkServer(): Verificar se servidor está online');
