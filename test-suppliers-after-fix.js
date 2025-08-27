// Script para testar a API de fornecedores após correção das políticas RLS
// Execute este script no console do navegador

console.log('🧪 Testando API de fornecedores após correção RLS...');

async function testSuppliersAfterFix() {
  try {
    // 1. Verificar token de autenticação
    console.log('1️⃣ Verificando autenticação...');
    const token = localStorage.getItem('supabase.auth.token') || 
                  sessionStorage.getItem('supabase.auth.token');
    
    if (!token) {
      console.log('❌ Token não encontrado. Faça login primeiro.');
      return;
    }
    
    console.log('✅ Token encontrado');
    
    // 2. Testar API de fornecedores
    console.log('2️⃣ Testando API /api/suppliers...');
    const response = await fetch('http://localhost:5002/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando!');
      console.log('📊 Dados recebidos:', data);
      
      if (data.suppliers) {
        console.log(`📋 Total de fornecedores: ${data.suppliers.length}`);
        data.suppliers.forEach((supplier, index) => {
          console.log(`  ${index + 1}. ${supplier.code}: ${supplier.name} (${supplier.type})`);
        });
      }
      
      if (data.pagination) {
        console.log('📄 Paginação:', data.pagination);
      }
    } else {
      const error = await response.text();
      console.error('❌ Erro na API:', error);
      
      try {
        const errorJson = JSON.parse(error);
        console.error('❌ Detalhes do erro:', errorJson);
      } catch {
        console.error('❌ Erro em texto:', error);
      }
    }
    
    // 3. Testar API de estatísticas
    console.log('3️⃣ Testando API /api/suppliers/stats/overview...');
    const statsResponse = await fetch('http://localhost:5002/api/suppliers/stats/overview', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Stats Status:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Stats funcionando:', statsData);
    } else {
      const statsError = await statsResponse.text();
      console.error('❌ Erro nos stats:', statsError);
    }
    
    // 4. Testar com query parameters
    console.log('4️⃣ Testando com query parameters...');
    const paramsResponse = await fetch('http://localhost:5002/api/suppliers?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Params Status:', paramsResponse.status);
    
    if (paramsResponse.ok) {
      const paramsData = await paramsResponse.json();
      console.log('✅ Query params funcionando:', paramsData);
    } else {
      const paramsError = await paramsResponse.text();
      console.error('❌ Erro com params:', paramsError);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Função para verificar se o erro 500 foi resolvido
function checkError500Resolution() {
  console.log('🔍 Verificando se o erro 500 foi resolvido...');
  
  // Verificar se há erros no console relacionados a suppliers
  const originalError = console.error;
  let suppliersErrors = [];
  
  console.error = function(...args) {
    if (args.some(arg => String(arg).includes('suppliers') || String(arg).includes('500'))) {
      suppliersErrors.push(args);
    }
    originalError.apply(console, args);
  };
  
  // Restaurar console.error após 10 segundos
  setTimeout(() => {
    console.error = originalError;
    
    if (suppliersErrors.length === 0) {
      console.log('✅ Nenhum erro 500 detectado!');
    } else {
      console.log('❌ Ainda há erros:', suppliersErrors);
    }
  }, 10000);
}

// Executar testes
console.log('🚀 Iniciando testes após correção RLS...');
testSuppliersAfterFix();
checkError500Resolution();

// Expor função para uso manual
window.testSuppliersAfterFix = testSuppliersAfterFix;

console.log('🛠️ Função disponível:');
console.log('- testSuppliersAfterFix(): Testar API após correção');
